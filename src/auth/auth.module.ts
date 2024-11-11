// Import core Module decorator from NestJS
import { Module } from '@nestjs/common';

// Import the Authentication Controller
import { AuthController } from './auth.controller';

// Import the Authentication Service
import { AuthService } from './auth.service';

// Import Mongoose module for MongoDB integration
import { MongooseModule } from '@nestjs/mongoose';

// Import the User schema definition
import { UserSchema } from './schemas/user.schema';

// Import Passport for authentication strategies
import { PassportModule } from '@nestjs/passport'

// Import JWT module for token handling
import { JwtModule } from '@nestjs/jwt'

// Import ConfigService for environment variables
import { ConfigService } from '@nestjs/config'

@Module({  // Decorator that marks this class as a NestJS module
  imports: [  // Array of modules this module depends on
    // Configure Passport module with JWT as default strategy
    PassportModule.register({
      defaultStrategy: 'jwt'  // Use JWT as the default authentication strategy
    }),

    // Configure JWT Module asynchronously
    JwtModule.registerAsync({
      inject: [ConfigService],  // Inject ConfigService to access environment variables
      useFactory: (config: ConfigService) => {  // Factory function to create JWT options
        return { 
          secret: config.get<string>('JWT_SECRET'),  // Get JWT secret from environment
          signOptions: {
            expiresIn: config.get<string | number>("JWT_EXPIRES")  // Get JWT expiration from environment
          },
        };
      },
    }),

    // Configure Mongoose for the User model
    MongooseModule.forFeature([{
      name: 'User',  // Name of the model
      schema: UserSchema  // Schema definition for the model
    }])
  ],

  controllers: [AuthController],  // Register the auth controller
  providers: [AuthService, ConfigService],  // Register services/providers
})

export class AuthModule {}  // Export the module class