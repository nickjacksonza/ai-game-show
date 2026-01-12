import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from './index.js';
import { findOrCreateUser, findUserById } from '../db/repositories/users.js';

export function configurePassport(): void {
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const user = findUserById(id);
    done(null, user);
  });

  // Google OAuth Strategy
  if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientId,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: '/api/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          try {
            const user = findOrCreateUser({
              provider: 'google',
              providerId: profile.id,
              email: profile.emails?.[0]?.value || `${profile.id}@google.local`,
              displayName: profile.displayName || null,
              avatarUrl: profile.photos?.[0]?.value || null,
            });
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  // GitHub OAuth Strategy
  if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: config.oauth.github.clientId,
          clientSecret: config.oauth.github.clientSecret,
          callbackURL: '/api/auth/github/callback',
        },
        (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: (err: Error | null, user?: Express.User) => void
        ) => {
          try {
            const user = findOrCreateUser({
              provider: 'github',
              providerId: profile.id,
              email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
              displayName: profile.displayName || profile.username || null,
              avatarUrl: profile.photos?.[0]?.value || null,
            });
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }
}
