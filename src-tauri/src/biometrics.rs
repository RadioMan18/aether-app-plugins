use crate::database::PartitionManager;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use windows::{
    core::HSTRING,
    Security::Credentials::UI::{
        UserConsentVerificationResult, UserConsentVerifier, UserConsentVerifierAvailability,
    },
};

#[derive(Debug, Serialize, Deserialize)]
pub struct BiometricResult {
    pub success: bool,
    pub available: bool,
    pub message: String,
}

pub struct BiometricAuth;

impl BiometricAuth {
    pub fn new() -> Self {
        Self
    }

    pub async fn invoke_challenge(&self, message: &str) -> Result<BiometricResult, String> {
        self.invoke_named_challenge("default", message).await
    }

    pub async fn invoke_named_challenge(
        &self,
        name: &str,
        message: &str,
    ) -> Result<BiometricResult, String> {
        log::info!(
            "Biometric challenge requested: name={}, message={}",
            name,
            message
        );

        let availability = UserConsentVerifier::CheckAvailabilityAsync()
            .map_err(|e| format!("Failed to check biometric availability: {}", e))?
            .await
            .map_err(|e| format!("Failed to get biometric availability: {}", e))?;

        let available = availability == UserConsentVerifierAvailability::Available;

        if !available {
            return Ok(BiometricResult {
                success: false,
                available: false,
                message: format!("Windows Hello not available: {:?}", availability),
            });
        }

        let operation = UserConsentVerifier::RequestVerificationAsync(&HSTRING::from(message))
            .map_err(|e| format!("Failed to request verification: {}", e))?;

        let result = operation
            .await
            .map_err(|e| format!("Verification failed: {}", e))?;

        let success = result == UserConsentVerificationResult::Verified;

        Ok(BiometricResult {
            success,
            available: true,
            message: if success {
                format!("Biometric verification successful for '{}'", name)
            } else {
                format!("Biometric verification failed for '{}': {:?}", name, result)
            },
        })
    }

    pub async fn unlock_partition(
        &self,
        name: &str,
        message: &str,
        app_data_dir: PathBuf,
    ) -> Result<(), String> {
        let result = self.invoke_named_challenge(name, message).await?;
        if !result.success {
            return Err(result.message);
        }

        PartitionManager::global().get_or_open(name, app_data_dir)?;
        Ok(())
    }
}
