import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getDatabase } from '@/lib/mongodb';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !user.email) return true;

      // Upsert user into MongoDB if configured
      try {
        const db = await getDatabase();
        if (db) {
          const usersCol = db.collection('users');
          await usersCol.updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name || '',
                email: user.email,
                image: user.image || '',
                provider: account?.provider || 'google',
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );

          // Ensure settings, journals, and todos collections exist
          const existing = (await db.listCollections().toArray()).map((c) => c.name);
          if (!existing.includes('settings')) await db.createCollection('settings');
          if (!existing.includes('journals')) await db.createCollection('journals');
          if (!existing.includes('todos')) await db.createCollection('todos');

          // Initialize user settings document if not present
          await db.collection('settings').updateOne(
            { userEmail: user.email },
            {
              $set: {
                userEmail: user.email,
                userName: user.name || 'Learner',
                updatedAt: new Date(),
              },
              $setOnInsert: {
                dailyCommitmentMinutes: 180,
                theme: 'dark',
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.error('ProgressOS: Error upserting user in MongoDB:', err);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string) || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/', // In-app modal / button rather than custom sign-in page
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'progress-os-development-secret-change-in-production',
});
