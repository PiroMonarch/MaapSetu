import { Instrument, ComplianceRule, Report, User } from "./models";

export const seedDatabase = async () => {
  const instrCount = await Instrument.countDocuments();
  if (instrCount === 0) {
    console.log("Seeding initial instruments...");
    await Instrument.insertMany([
      {
        manufacturer: "Mettler Toledo",
        model: "XPR205",
        serialNumber: "MT-XPR-001",
        accuracyClass: "I",
        maxCapacity: 220, // g
        minCapacity: 0.01,
        eValue: 0.001,
        dValue: 0.00001,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600"
      },
      {
        manufacturer: "Sartorius",
        model: "Cubis II",
        serialNumber: "SAR-CB-992",
        accuracyClass: "II",
        maxCapacity: 5200,
        minCapacity: 0.5,
        eValue: 0.1,
        dValue: 0.01,
        image: "https://images.unsplash.com/photo-1615554851221-c167449a5fb8?auto=format&fit=crop&q=80&w=600"
      },
      {
        manufacturer: "Ohaus",
        model: "Explorer Semi-Micro",
        serialNumber: "OH-EX-442",
        accuracyClass: "I",
        maxCapacity: 120,
        minCapacity: 0.001,
        eValue: 0.001,
        dValue: 0.00001,
        image: "https://images.unsplash.com/photo-1580978713028-d8900885e33d?auto=format&fit=crop&q=80&w=600"
      },
      {
        manufacturer: "A&D Weighing",
        model: "BM-252",
        serialNumber: "AD-BM-110",
        accuracyClass: "I",
        maxCapacity: 250,
        minCapacity: 0.01,
        eValue: 0.001,
        dValue: 0.00001,
        image: "https://images.unsplash.com/photo-1620336214301-b54131584c2f?auto=format&fit=crop&q=80&w=600"
      },
      {
        manufacturer: "KERN & SOHN",
        model: "ABJ-NM",
        serialNumber: "K-ABJ-005",
        accuracyClass: "II",
        maxCapacity: 120,
        minCapacity: 0.01,
        eValue: 0.001,
        dValue: 0.0001,
        image: "https://images.unsplash.com/photo-1594895111166-41f2249e49a2?auto=format&fit=crop&q=80&w=600"
      }
    ]);
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log("Seeding initial user...");
    await User.create({
      email: "inspector@maapsetu.com",
      password: "password123", // In a real app this would be hashed
      name: "Anjali",
      role: "TECHNICIAN"
    });
  }

  const rulesCount = await ComplianceRule.countDocuments();
  if (rulesCount === 0) {
    await ComplianceRule.insertMany([
      {
        name: "Weighing Performance",
        condition: "mpe",
        limits: { mpeBase: 0.5 }
      },
      {
        name: "Eccentricity",
        condition: "mpe",
        limits: { mpeBase: 1.0 }
      },
      {
        name: "Repeatability",
        condition: "mpe",
        limits: { mpeBase: 0.5 }
      }
    ]);
  }
};
