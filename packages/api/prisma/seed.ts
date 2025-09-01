import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@permitmanagement.com' },
    update: {},
    create: {
      email: 'admin@permitmanagement.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Florida counties data
  const floridaCounties = [
    { name: 'Alachua County', code: 'ALA' },
    { name: 'Baker County', code: 'BAK' },
    { name: 'Bay County', code: 'BAY' },
    { name: 'Bradford County', code: 'BRA' },
    { name: 'Brevard County', code: 'BRE' },
    { name: 'Broward County', code: 'BRO' },
    { name: 'Calhoun County', code: 'CAL' },
    { name: 'Charlotte County', code: 'CHA' },
    { name: 'Citrus County', code: 'CIT' },
    { name: 'Clay County', code: 'CLA' },
    { name: 'Collier County', code: 'COL' },
    { name: 'Columbia County', code: 'COU' },
    { name: 'DeSoto County', code: 'DES' },
    { name: 'Dixie County', code: 'DIX' },
    { name: 'Duval County', code: 'DUV' },
    { name: 'Escambia County', code: 'ESC' },
    { name: 'Flagler County', code: 'FLA' },
    { name: 'Franklin County', code: 'FRA' },
    { name: 'Gadsden County', code: 'GAD' },
    { name: 'Gilchrist County', code: 'GIL' },
    { name: 'Glades County', code: 'GLA' },
    { name: 'Gulf County', code: 'GUL' },
    { name: 'Hamilton County', code: 'HAM' },
    { name: 'Hardee County', code: 'HAR' },
    { name: 'Hendry County', code: 'HEN' },
    { name: 'Hernando County', code: 'HER' },
    { name: 'Highlands County', code: 'HIG' },
    { name: 'Hillsborough County', code: 'HIL' },
    { name: 'Holmes County', code: 'HOL' },
    { name: 'Indian River County', code: 'IND' },
    { name: 'Jackson County', code: 'JAC' },
    { name: 'Jefferson County', code: 'JEF' },
    { name: 'Lafayette County', code: 'LAF' },
    { name: 'Lake County', code: 'LAK' },
    { name: 'Lee County', code: 'LEE' },
    { name: 'Leon County', code: 'LEO' },
    { name: 'Levy County', code: 'LEV' },
    { name: 'Liberty County', code: 'LIB' },
    { name: 'Madison County', code: 'MAD' },
    { name: 'Manatee County', code: 'MAN' },
    { name: 'Marion County', code: 'MAR' },
    { name: 'Martin County', code: 'MART' },
    { name: 'Miami-Dade County', code: 'MIA' },
    { name: 'Monroe County', code: 'MON' },
    { name: 'Nassau County', code: 'NAS' },
    { name: 'Okaloosa County', code: 'OKA' },
    { name: 'Okeechobee County', code: 'OKE' },
    { name: 'Orange County', code: 'ORA' },
    { name: 'Osceola County', code: 'OSC' },
    { name: 'Palm Beach County', code: 'PAL' },
    { name: 'Pasco County', code: 'PAS' },
    { name: 'Pinellas County', code: 'PIN' },
    { name: 'Polk County', code: 'POL' },
    { name: 'Putnam County', code: 'PUT' },
    { name: 'St. Johns County', code: 'STJ' },
    { name: 'St. Lucie County', code: 'STL' },
    { name: 'Santa Rosa County', code: 'SAR' },
    { name: 'Sarasota County', code: 'SAS' },
    { name: 'Seminole County', code: 'SEM' },
    { name: 'Sumter County', code: 'SUM' },
    { name: 'Suwannee County', code: 'SUW' },
    { name: 'Taylor County', code: 'TAY' },
    { name: 'Union County', code: 'UNI' },
    { name: 'Volusia County', code: 'VOL' },
    { name: 'Wakulla County', code: 'WAK' },
    { name: 'Walton County', code: 'WAL' },
    { name: 'Washington County', code: 'WAS' },
  ];

  // Create counties
  for (const county of floridaCounties) {
    await prisma.county.upsert({
      where: { code: county.code },
      update: {},
      create: county,
    });
  }

  console.log('✅ Florida counties created');

  // Create sample checklist templates for Miami-Dade County
  const miamiDadeCounty = await prisma.county.findUnique({
    where: { code: 'MIA' },
  });

  if (miamiDadeCounty) {
    const sampleTemplates = [
      {
        label: 'Building Permit Application',
        category: 'Application',
        required: true,
        sort: 1,
      },
      {
        label: 'Site Plan',
        category: 'Plans',
        required: true,
        sort: 2,
      },
      {
        label: 'Foundation Plans',
        category: 'Plans',
        required: true,
        sort: 3,
      },
      {
        label: 'Electrical Plans',
        category: 'Plans',
        required: false,
        sort: 4,
      },
      {
        label: 'Plumbing Plans',
        category: 'Plans',
        required: false,
        sort: 5,
      },
      {
        label: 'HVAC Plans',
        category: 'Plans',
        required: false,
        sort: 6,
      },
      {
        label: 'Energy Code Compliance',
        category: 'Compliance',
        required: true,
        sort: 7,
      },
      {
        label: 'Wind Load Calculations',
        category: 'Engineering',
        required: true,
        sort: 8,
      },
      {
        label: 'Soil Report',
        category: 'Site',
        required: true,
        sort: 9,
      },
      {
        label: 'Flood Zone Determination',
        category: 'Site',
        required: true,
        sort: 10,
      },
    ];

    for (const template of sampleTemplates) {
      await prisma.countyChecklistTemplateItem.create({
        data: {
          ...template,
          countyId: miamiDadeCounty.id,
        },
      });
    }

    console.log('✅ Sample checklist templates created for Miami-Dade County');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
