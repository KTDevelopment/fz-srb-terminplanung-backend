"use strict";
import {config} from 'node-config-ts'
import {LogLevel} from "../logger/logLevels";

export const Config: () => AppConfig = () => config;

export enum Environment {
    DEFAULT = 'default',
    TEST = 'test',
    DEVELOPMENT = 'development',
    STAGING = 'staging',
    PRODUCTION = 'production'
}

export interface AppConfig {
    env: Environment
    port: number
    database: DatabaseConfig
    auth: AuthConfig
    ics: {
        icsRootPath: string
    }
    firebase: FireBaseConfig,
    mail: MailConfig,
    logger: LoggerConfig,
    adminClient: AdminClientConfig,
    fileStorage: FileStorageConfig,
    backup: BackupConfig,
}

export interface DatabaseConfig {
    type: "mysql" | "sqlite",
    host: string,
    database: string,
    port: number,
    username: string,
    password: string,
}

export interface AdminClientConfig {
    location: string
}

export interface LoggerConfig {
    isEnabled: boolean;
    level: LogLevel;
    sentry?: {
        dsn: string;
        rootDir: string;
        releaseTemplate: string
        environment: string
    }
}

export interface FireBaseConfig {
    isEnabled: boolean,
    serviceAccount: GoogleServiceAccount
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

export interface BackupConfig {
    enabled: boolean,
    tempDirectory: string,
    driveConfig: GoogleServiceAccount,
    driveDirectoryName: string,
}

export interface GoogleServiceAccount extends DriveConfig {
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

