//! Centralized configuration constants and resolvers for Eleva Remote Desk.
//!
//! All compile-time and runtime overrides for Eleva infrastructure endpoints,
//! branding metadata, and license tracking are declared here.

pub const DEFAULT_ID_SERVER: &str = match option_env!("ELEVA_REMOTE_ID_SERVER") {
    Some(s) => s,
    None => "desk.elevabs.com:21116",
};

pub const DEFAULT_RELAY_SERVER: &str = match option_env!("ELEVA_REMOTE_RELAY_SERVER") {
    Some(s) => s,
    None => "desk.elevabs.com:21117",
};

pub const DEFAULT_PUBLIC_KEY: &str = match option_env!("ELEVA_REMOTE_PUBLIC_KEY") {
    Some(k) => k,
    None => "i+pabfCpXmuL5lB8axrW56XyZxrj0d4O3bOYJgLyfIo=",
};

pub const DEFAULT_API_URL: &str = match option_env!("ELEVA_REMOTE_API_URL") {
    Some(s) => s,
    None => "https://api-remote.elevabs.com",
};

pub const DEFAULT_PANEL_URL: &str = "https://remote.elevabs.com";

pub const APP_NAME: &str = "Eleva Remote Desk";
pub const APP_NAME_SHORT: &str = "Remote Desk";
pub const APP_ORG: &str = "Eleva Business Solutions";
pub const APP_VERSION: &str = "1.0.0";
pub const BASE_UPSTREAM_VERSION: &str = "1.3.9";
pub const BASE_UPSTREAM_COMMIT: &str = "3dbe27ea57429cf2b57cbae3b894a9f9a88ff8b5";
pub const SOURCE_REPO_URL: &str = "https://github.com/kaiquecrestan/eleva-remote-desk";
pub const LICENSE_NAME: &str = "GNU Affero General Public License v3.0 (AGPL-3.0)";
