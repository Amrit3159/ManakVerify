import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signJwt } from '../utils/jwt';
import { AuthUserPayload } from '../types';

export class AuthService {
  static async syncFirebaseUser(
    decoded: { uid: string; email: string; name?: string },
    profileData?: { name?: string; phone?: string; businessName?: string }
  ) {
    const email = decoded.email.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: decoded.uid }, { email }],
      },
      include: {
        business: true,
      },
    });

    if (user) {
      // If user exists but firebaseUid wasn't linked, link it now
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: decoded.uid },
          include: { business: true },
        });
      }

      const authPayload: AuthUserPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        phone: user.phone,
        businessId: user.businessId,
        inspectorId: user.inspectorId,
      };
      const token = signJwt(authPayload);

      return {
        ...authPayload,
        firebaseUid: user.firebaseUid,
        token,
      };
    }

    // Create new MaanakVerify user with default business role
    return await prisma.$transaction(async (tx) => {
      const displayName = profileData?.name || decoded.name || email.split('@')[0];
      const phone = profileData?.phone || '+91 98000 00000';
      const businessName = profileData?.businessName || `${displayName}'s Enterprise`;

      const newUser = await tx.user.create({
        data: {
          firebaseUid: decoded.uid,
          name: displayName,
          email,
          role: 'business',
          phone,
          joinedDate: today,
        },
      });

      const business = await tx.business.create({
        data: {
          name: businessName,
          gstin: `07AAACK${Math.floor(1000 + Math.random() * 9000)}M1Z5`,
          address: 'Commercial Premises, Phase I',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          contactPerson: displayName,
          phone,
          email,
          ownerId: newUser.id,
          registrationDate: today,
          status: 'ACTIVE',
          category: 'Retail Trade',
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: newUser.id },
        data: { businessId: business.id },
      });

      const authPayload: AuthUserPayload = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role as any,
        phone: updatedUser.phone,
        businessId: business.id,
        inspectorId: null,
      };
      const token = signJwt(authPayload);

      return {
        ...authPayload,
        firebaseUid: updatedUser.firebaseUid,
        token,
      };
    });
  }
  static async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'business' | 'inspector' | 'admin';
    businessName?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    category?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      const error: any = new Error('A user with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const today = new Date().toISOString().split('T')[0];

    // Transaction to create User and associated Business if role is business
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: data.role,
          phone: data.phone,
          joinedDate: today,
        },
      });

      let businessId: string | undefined = undefined;

      if (data.role === 'business') {
        const business = await tx.business.create({
          data: {
            name: data.businessName || `${data.name}'s Enterprise`,
            gstin: data.gstin || `GSTIN-${Date.now()}`,
            address: data.address || 'Address pending verification',
            city: data.city || 'City',
            state: data.state || 'State',
            pincode: data.pincode || '110001',
            contactPerson: data.name,
            phone: data.phone,
            email: data.email.toLowerCase(),
            ownerId: user.id,
            registrationDate: today,
            status: 'ACTIVE',
            category: data.category || 'Retail Trade',
          },
        });

        businessId = business.id;
        await tx.user.update({
          where: { id: user.id },
          data: { businessId },
        });
      }

      const authPayload: AuthUserPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        phone: user.phone,
        businessId,
      };

      const token = signJwt(authPayload);

      return {
        user: authPayload,
        token,
      };
    });
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.passwordHash) {
      const error: any = new Error('This account was created with Google or an external provider. Please sign in with Google.');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const authPayload: AuthUserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      phone: user.phone,
      businessId: user.businessId,
      inspectorId: user.inspectorId,
    };

    const token = signJwt(authPayload);

    return {
      user: authPayload,
      token,
    };
  }

  static async demoLogin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error('Demo account not found in database.');
      error.statusCode = 404;
      throw error;
    }

    const authPayload: AuthUserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      phone: user.phone,
      businessId: user.businessId,
      inspectorId: user.inspectorId,
    };

    const token = signJwt(authPayload);

    return {
      user: authPayload,
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        businessId: true,
        inspectorId: true,
        joinedDate: true,
        business: true,
      },
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}
