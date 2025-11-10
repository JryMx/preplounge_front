import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        password_hash VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(50) DEFAULT 'local',
        provider_id VARCHAR(255),
        photo VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_unique ON users(provider, provider_id);
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

export function configurePassport() {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND provider = $2', [email, 'local']);
      const user = result.rows[0];
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      return done(null, {
        id: user.id,
        email: user.email,
        displayName: user.name,
        provider: user.provider,
        photo: user.photo
      });
    } catch (error) {
      return done(error);
    }
  }));

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const baseURL = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}:3001` 
      : 'http://localhost:3001';
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${baseURL}/api/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        let result = await pool.query('SELECT * FROM users WHERE provider = $1 AND provider_id = $2', ['google', profile.id]);
        let user = result.rows[0];
        
        if (!user && email) {
          const existingEmailUser = await pool.query('SELECT * FROM users WHERE email = $1 AND provider = $2', [email, 'local']);
          if (existingEmailUser.rows.length > 0) {
            const insertResult = await pool.query(
              'INSERT INTO users (email, name, provider, provider_id, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [email, profile.displayName, 'google', profile.id, profile.photos?.[0]?.value]
            );
            user = insertResult.rows[0];
          }
        }
        
        if (!user) {
          const insertResult = await pool.query(
            'INSERT INTO users (email, name, provider, provider_id, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, profile.displayName, 'google', profile.id, profile.photos?.[0]?.value]
          );
          user = insertResult.rows[0];
        }
        
        return done(null, {
          id: user.id,
          email: user.email,
          displayName: user.name,
          provider: user.provider,
          photo: user.photo
        });
      } catch (error) {
        return done(error);
      }
    }));
  }

  if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
    const baseURL = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}:3001` 
      : 'http://localhost:3001';
    
    passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: `${baseURL}/api/auth/kakao/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json?.kakao_account?.email || null;
        
        let result = await pool.query('SELECT * FROM users WHERE provider = $1 AND provider_id = $2', ['kakao', profile.id]);
        let user = result.rows[0];
        
        if (!user && email) {
          const existingEmailUser = await pool.query('SELECT * FROM users WHERE email = $1 AND provider = $2', [email, 'local']);
          if (existingEmailUser.rows.length > 0) {
            const insertResult = await pool.query(
              'INSERT INTO users (email, name, provider, provider_id, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [email, profile.displayName || profile.username, 'kakao', profile.id, profile._json?.properties?.profile_image]
            );
            user = insertResult.rows[0];
          }
        }
        
        if (!user) {
          const insertResult = await pool.query(
            'INSERT INTO users (email, name, provider, provider_id, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, profile.displayName || profile.username, 'kakao', profile.id, profile._json?.properties?.profile_image]
          );
          user = insertResult.rows[0];
        }
        
        return done(null, {
          id: user.id,
          email: user.email,
          displayName: user.name,
          provider: user.provider,
          photo: user.photo
        });
      } catch (error) {
        return done(error);
      }
    }));
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = result.rows[0];
      
      if (user) {
        done(null, {
          id: user.id,
          email: user.email,
          displayName: user.name,
          provider: user.provider,
          photo: user.photo
        });
      } else {
        done(null, null);
      }
    } catch (error) {
      done(error);
    }
  });
}

export default passport;
