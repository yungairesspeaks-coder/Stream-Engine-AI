terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 5.0, < 8.0"
    }
  }
}

variable "project_id" {
  description = "Google Cloud project ID that owns the Firebase project."
  type        = string
}

provider "google-beta" {
  project = var.project_id
}

resource "google_firebase_android_app" "default" {
  provider      = google-beta
  project       = var.project_id
  display_name  = "Stream Engine AI"
  package_name  = "com.yungaires.streamengineai"
  sha1_hashes   = ["1b:38:7e:5b:6b:bb:e8:fa:39:27:a7:3f:da:56:46:0a:58:93:e9:cf"]

  # Add sha256_hashes after retrieving the actual SHA-256 certificate
  # fingerprint from the EAS Android keystore. Do not use a placeholder.
}
