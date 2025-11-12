import passport from 'passport';

export async function initializeDatabase() {
  console.log('Database initialization skipped - using loaning.ai remote database');
}

export function configurePassport() {
  console.log('Passport configured for loaning.ai OAuth integration');

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (user, done) => {
    done(null, user);
  });
}

export default passport;
