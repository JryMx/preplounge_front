import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';

const users = new Map();

export function configurePassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: '/api/auth/google/callback',
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: `google_${profile.id}`,
      provider: 'google',
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      photo: profile.photos?.[0]?.value,
      profile: profile,
    };
    
    users.set(user.id, user);
    return done(null, user);
  }));

  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackURL: '/api/auth/kakao/callback',
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: `kakao_${profile.id}`,
      provider: 'kakao',
      displayName: profile.displayName || profile.username,
      email: profile._json?.kakao_account?.email,
      photo: profile._json?.properties?.profile_image,
      profile: profile,
    };
    
    users.set(user.id, user);
    return done(null, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = users.get(id);
    done(null, user || null);
  });
}

export default passport;
