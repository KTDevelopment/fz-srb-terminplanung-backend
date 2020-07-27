"use strict";
import {config} from 'node-config-ts'

const version = require('../version.json').version;

config.version = version;

export const Config: () => AppConfig = () => config;

export interface AppConfig {
    env: 'default' | 'test' | 'development' | 'staging' | 'production';
    port: number,
    version: string,
    database: any
    auth: AuthConfig
    ics: {
        icsRootPath: string
    }
    firebase: FireBaseConfig
    drive: {
        folderId: string
        token: GoogleToken
        credentials: GoogleCredentials
    },
    mail: MailConfig,
    logger: LoggerConfig,
    adminClient: AdminClientConfig,
    fileStorage: FileStorageConfig,
}

export interface AdminClientConfig {
    location: string
}

export interface LoggerConfig {
    isEnabled: boolean;
    sentry: {
        dsn: string;
        rootDir: string;
        releaseTemplate: string
        environment: string
    }
}

export interface FireBaseConfig {
    isEnabled: boolean,
    serviceAccount: {
        type: string,
        project_id: string,
        private_key_id: string,
        private_key: string,
        client_email: string,
        client_id: string,
        auth_uri: string,
        token_uri: string,
        auth_provider_x509_cert_url: string,
        client_x509_cert_url: string
    }
    databaseUrl: string
}

export interface MailConfig {
    SMTPConfig: {
        host: string,
        port: number,
        auth: {
            user: string,
            pass: string,
        },
        tls: {
            rejectUnauthorized: boolean
        }
    }
    passwordResetBaseUrl: string
}

export interface GoogleToken {
    access_token: string,
    refresh_token: string,
    token_type: string,
    expiry_date: number
}

export interface GoogleCredentials {
    client_id: string,
    project_id: string,
    auth_uri: string,
    token_uri: string
    auth_provider_x509_cert_url: string,
    client_secret: string,
    redirect_uris: string[]
}

export interface AuthConfig {
    accessSecret: string,
    refreshSecret: string,
    accessTokenExpiresIn: string,
    refreshTokenExpiresIn: string,
    passwordResetTokenExpiresIn: string,
}

export interface FileStorageConfig {
    directory: string
}

