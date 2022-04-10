import Joi = require("joi");
import {Environment} from "./config";
import {LogLevel} from "../logger/logLevels";

export const configValidation = () => {
    return Joi.object({
        env: Joi.string().valid(...Object.values(Environment)),
        port: Joi.number().default(3000),
        database: Joi.object({
            type: Joi.string().valid("mysql", "sqlite"),
            host: optionalDatabaseConfig('mysql', Joi.string()),
            database: Joi.string(),
            port: optionalDatabaseConfig('mysql', Joi.number()),
            username: optionalDatabaseConfig('mysql', Joi.string()),
            password: optionalDatabaseConfig('mysql', Joi.string().allow("")),
            synchronize: Joi.boolean(),
            logging: Joi.boolean(),
            migrations: Joi.array().items(Joi.string()),
            dropSchema: Joi.boolean(),
            autoLoadEntities: Joi.boolean(),
        }),
        auth: Joi.object({
            accessSecret: Joi.string(),
            refreshSecret: Joi.string(),
            accessTokenExpiresIn: Joi.string(),
            refreshTokenExpiresIn: Joi.string(),
            passwordResetTokenExpiresIn: Joi.string(),
        }),
        ics: {
            icsRootPath: Joi.string(),
        },
        firebase: Joi.object({
            isEnabled: Joi.boolean(),
            serviceAccount: getServiceAccountSchemaValidation(),
            databaseUrl: Joi.string(),
        }),
        mail: Joi.object({
            SMTPConfig: Joi.object({
                host: Joi.string(),
                port: Joi.number(),
                auth: Joi.object({
                    user: Joi.string(),
                    pass: Joi.string(),
                }),
                tls: Joi.object({
                    rejectUnauthorized: Joi.boolean(),
                })
            }),
            passwordResetBaseUrl: Joi.string()
        }),
        logger: Joi.object({
            isEnabled: Joi.boolean(),
            level: Joi.string().valid(...Object.values(LogLevel)).default(LogLevel.DEBUG),
            sentry: Joi.object({
                dsn: Joi.string(),
                rootDir: Joi.string(),
                releaseTemplate: Joi.string(),
                environment: Joi.string(),
            }).optional()
        }),
        adminClient: Joi.object({
            location: Joi.string()
        }),
        fileStorage: Joi.object({
            directory: Joi.string()
        }),
        backup: Joi.object({
            enabled: Joi.boolean(),
            tempDirectory: Joi.string(),
            driveConfig: getServiceAccountSchemaValidation(),
            driveDirectoryName: Joi.string()
        }),
    });
}

function getServiceAccountSchemaValidation() {
    return Joi.object({
        type: Joi.string(),
        project_id: Joi.string(),
        private_key_id: Joi.string(),
        private_key: Joi.string(),
        client_email: Joi.string(),
        client_id: Joi.string(),
        auth_uri: Joi.string(),
        token_uri: Joi.string(),
        auth_provider_x509_cert_url: Joi.string(),
        client_x509_cert_url: Joi.string(),
    });
}

function optionalDatabaseConfig(type: string, validation: any): Joi.AlternativesSchema {
    return Joi.alternatives().conditional('type', {
        is: type,
        then: validation,
        otherwise: Joi.optional()
    })
}
