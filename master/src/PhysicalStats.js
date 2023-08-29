class StrengthApplyType
{
    ToHit;
    ToDam;
    Carry;
    Wield;

    constructor(tohit, todam, carry, wield)
    {
        this.ToHit = tohit;
        this.ToDam = todam;
        this.Carry = carry;
        this.Wield = wield;
    }
}

class IntelligenceApplyType
{
    Learn;
    constructor(learn)
    { this.Learn = learn; }
};

class WisdomApplyType
{
    Practice;

    constructor(practice)
    {
        this.Practice = practice;
    }
};

class DexterityApplyType
{
    Defensive;
    Carry;
    ToHit;
    Armor;

    constructor(defensive, carry, tohit, armor)
    {
        this.Defensive = defensive;
        this.Carry = carry;
        this.ToHit = tohit;
        this.Armor = armor;

    }
};

class ConstitutionApplyType
{
    Hitpoints;
    Shock;

    constructor(Hitpoints, shock)
    {
        this.Hitpoints = Hitpoints;
        this.Shock = shock;
    }
}
class PhysicalStats {
    static PhysicalStatTypes = {"Strength": 0, "Wisdom": 1, "Intelligence": 2, "Dexterity": 3, "Constitution": 4, "Charisma": 5 };
    static PhysicalStatTypesArray = ["Strength", "Wisdom", "Intelligence", "Dexterity", "Constitution", "Charisma"];

    static StrengthApply = [
        new StrengthApplyType ( -5, -4,   0,  0 ),  /* 0  */
        new StrengthApplyType ( -5, -4,   3,  1 ),  /* 1  */
        new StrengthApplyType ( -3, -2,   3,  2 ),
        new StrengthApplyType ( -3, -1,  10,  3 ),  /* 3  */
        new StrengthApplyType ( -2, -1,  25,  4 ),
        new StrengthApplyType ( -2, -1,  55,  5 ),  /* 5  */
        new StrengthApplyType ( -1,  0,  80,  6 ),
        new StrengthApplyType ( -1,  0, 100,  7 ),
        new StrengthApplyType (  0,  0, 150,  8 ),
        new StrengthApplyType (  0,  0, 180,  9 ),
        new StrengthApplyType (  0,  0, 200, 10 ), /* 10  */
        new StrengthApplyType (  0,  0, 215, 11 ),
        new StrengthApplyType (  0,  0, 230, 12 ),
        new StrengthApplyType (  0,  0, 230, 13 ), /* 13  */
        new StrengthApplyType (  0,  1, 240, 14 ),
        new StrengthApplyType (  1,  1, 250, 15 ), /* 15  */
        new StrengthApplyType (  1,  2, 265, 16 ),
        new StrengthApplyType (  2,  3, 280, 22 ),
        new StrengthApplyType (  2,  3, 300, 25 ), /* 18  */
        new StrengthApplyType (  3,  4, 325, 30 ),
        new StrengthApplyType (  3,  5, 350, 35 ), /* 20  */
        new StrengthApplyType (  4,  6, 400, 40 ),
        new StrengthApplyType (  4,  6, 450, 45 ),
        new StrengthApplyType (  5,  7, 500, 50 ),
        new StrengthApplyType (  5,  8, 550, 55 ),
        new StrengthApplyType (  6,  9, 600, 60 )  /* 25   */
    ];

    static IntelligenceApply = [
        new IntelligenceApplyType (  3 ),	/*  0 */
        new IntelligenceApplyType (  5 ),	/*  1 */
        new IntelligenceApplyType (  7 ),
        new IntelligenceApplyType (  8 ),	/*  3 */
        new IntelligenceApplyType (  9 ),
        new IntelligenceApplyType ( 10 ),	/*  5 */
        new IntelligenceApplyType ( 11 ),
        new IntelligenceApplyType ( 12 ),
        new IntelligenceApplyType ( 13 ),
        new IntelligenceApplyType ( 15 ),
        new IntelligenceApplyType ( 17 ),	/* 10 */
        new IntelligenceApplyType ( 19 ),
        new IntelligenceApplyType ( 22 ),
        new IntelligenceApplyType ( 25 ),
        new IntelligenceApplyType ( 28 ),
        new IntelligenceApplyType ( 31 ),	/* 15 */
        new IntelligenceApplyType ( 34 ),
        new IntelligenceApplyType ( 37 ),
        new IntelligenceApplyType ( 40 ),	/* 18 */
        new IntelligenceApplyType ( 44 ),
        new IntelligenceApplyType ( 49 ),	/* 20 */
        new IntelligenceApplyType ( 55 ),
        new IntelligenceApplyType ( 60 ),
        new IntelligenceApplyType ( 70 ),
        new IntelligenceApplyType ( 80 ),
        new IntelligenceApplyType ( 85 )	/* 25 */
    ];



    static WisdomApply = [
        new WisdomApplyType( 0 ),	/*  0 */
        new WisdomApplyType( 0 ),	/*  1 */
        new WisdomApplyType( 0 ),
        new WisdomApplyType( 0 ),	/*  3 */
        new WisdomApplyType( 0 ),
        new WisdomApplyType( 1 ),	/*  5 */
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),	/* 10 */
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 1 ),
        new WisdomApplyType( 2 ),	/* 15 */
        new WisdomApplyType( 2 ),
        new WisdomApplyType( 2 ),
        new WisdomApplyType( 3 ),	/* 18 */
        new WisdomApplyType( 3 ),
        new WisdomApplyType( 3 ),	/* 20 */
        new WisdomApplyType( 3 ),
        new WisdomApplyType( 4 ),
        new WisdomApplyType( 4 ),
        new WisdomApplyType( 4 ),
        new WisdomApplyType( 5 )	/* 25 */
    ];



    static DexterityApply = [
        new DexterityApplyType(   60,0, 0, 0 ),   /* 0 */
        new DexterityApplyType(   50,0, 0, 0 ),   /* 1 */
        new DexterityApplyType(   50,0, 0, 0 ),
        new DexterityApplyType(   40,0, 0, 0 ),
        new DexterityApplyType(   30,0, 0, 0 ),
        new DexterityApplyType(   20,0, 0, 0 ),   /* 5 */
        new DexterityApplyType(   10,0, 0, 0 ),
        new DexterityApplyType(    0,0, 0, 0 ),
        new DexterityApplyType(    0,0, 0, 0 ),
        new DexterityApplyType(    0,0, 0, 0 ),
        new DexterityApplyType(    0,0, 0, 0 ),   /* 10 */
        new DexterityApplyType(    0,1, 0, 0 ),
        new DexterityApplyType(    0,1, 0, 0 ),
        new DexterityApplyType(    0,1, 0, 0 ),
        new DexterityApplyType(    0,2, 0, 0 ),
        new DexterityApplyType( - 10,2, 0, 0 ),   /* 15 */
        new DexterityApplyType( - 15,2, 0, 0 ),
        new DexterityApplyType( - 20,3, 0, 0 ),
        new DexterityApplyType( - 30,3, 0, 0 ),
        new DexterityApplyType( - 40,4, 0, 0 ),
        new DexterityApplyType( - 50,4, 0, 0 ),   /* 20 */
        new DexterityApplyType( - 60,5, 0, 0 ),
        new DexterityApplyType( - 75,6, 0, 0 ),
        new DexterityApplyType( - 90,7, 0, 0 ),
        new DexterityApplyType( -105,8, 0, 0 ),
        new DexterityApplyType( -120,9, 0, 0 )    /* 25 */
    ];


    static ConstitutionApply = [
        new ConstitutionApplyType ( -4, 20 ),   /*  0 */
        new ConstitutionApplyType ( -3, 25 ),   /*  1 */
        new ConstitutionApplyType ( -2, 30 ),
        new ConstitutionApplyType ( -2, 35 ),	  /*  3 */
        new ConstitutionApplyType ( -1, 40 ),
        new ConstitutionApplyType ( -1, 45 ),   /*  5 */
        new ConstitutionApplyType ( -1, 50 ),
        new ConstitutionApplyType (  0, 55 ),
        new ConstitutionApplyType (  0, 60 ),
        new ConstitutionApplyType (  0, 65 ),
        new ConstitutionApplyType (  0, 70 ),   /* 10 */
        new ConstitutionApplyType (  0, 75 ),
        new ConstitutionApplyType (  0, 80 ),
        new ConstitutionApplyType (  0, 85 ),
        new ConstitutionApplyType (  0, 88 ),
        new ConstitutionApplyType (  1, 90 ),   /* 15 */
        new ConstitutionApplyType (  2, 95 ),
        new ConstitutionApplyType (  2, 97 ),
        new ConstitutionApplyType (  3, 99 ),   /* 18 */
        new ConstitutionApplyType (  3, 99 ),
        new ConstitutionApplyType (  4, 99 ),   /* 20 */
        new ConstitutionApplyType (  4, 99 ),
        new ConstitutionApplyType (  5, 99 ),
        new ConstitutionApplyType (  6, 99 ),
        new ConstitutionApplyType (  7, 99 ),
        new ConstitutionApplyType (  8, 99 )    /* 25 */
    ];
}
module.exports = PhysicalStats;