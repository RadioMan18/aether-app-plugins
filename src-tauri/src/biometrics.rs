use serde::{Deserialize, Serialize};
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
                "Biometric verification successful".to_string()
            } else {
                format!("Biometric verification failed: {:?}", result)
            },
        })
    }
}
