import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { AuthenticatableInterface } from '../lib/auth/authenticatable.interface';
import { Type } from '@nestjs/common';
import { AuthServiceInterface } from '../lib/auth/interfaces/auth.service.interface';

export interface CorsConfig {
  enabled: boolean;
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  introspection: boolean;
  schemaDestination: string;
  sortSchema: boolean;
  formatError: (error: GraphQLError) => GraphQLFormattedError;
  wsOnConnect?: (context: any) => Promise<any>;
  wsOnDisconnect?: (context: any, code: number, reason: string) => Promise<any>;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
  accessSecret: string;
  refreshSecret: string;
}

interface AuthProvider {
  model: AuthenticatableInterface;
  service: Type<AuthServiceInterface>;
}

export interface AuthConfig {
  default: string;
  providers: {
    [key: string]: AuthProvider;
  };
}
