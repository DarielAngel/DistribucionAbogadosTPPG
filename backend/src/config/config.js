const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV !== 'production' && !isTest;

module.exports = {
  // Use in-memory sqlite for tests, file sqlite for development, and postgres for production (or DATABASE_URL).
  databaseUrl: process.env.DATABASE_URL || (isTest ? 'sqlite::memory:' : (isDev ? 'sqlite:./database.sqlite' : 'postgres://postgres:password@localhost:5432/abogados_db')),
  jwtSecret: process.env.JWT_SECRET || 'change-me'
};
