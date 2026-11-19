const presets = {
  sickleCell: {
    alleleLabel: "HbS",

    startingAlleleFreq: 0.02,
    populationSize: 500,
    generations: 150,
    yearsPerGeneration: 25,

    enableMutation: false,
    enableGeneFlow: false,
    enableSelection: true,
    enableDrift: true,

    forwardMutationRate: 0,
    reverseMutationRate: 0,

    migrationRate: 0,
    sourceAlleleFreq: 0,
    migrationGenerations: 0,

    fitnessAA: 0.2,
    fitnessAa: 1.0,
    fitnessaa: 0.89,
  },

  lactase: {
    alleleLabel: "Lactase-persistence-associated allele",

    startingAlleleFreq: 0.1,
    populationSize: 1000,
    generations: 150,
    yearsPerGeneration: 25,

    enableMutation: false,
    enableGeneFlow: false,
    enableSelection: true,
    enableDrift: true,

    forwardMutationRate: 0,
    reverseMutationRate: 0,

    migrationRate: 0,
    sourceAlleleFreq: 0,
    migrationGenerations: 0,

    fitnessAA: 1,
    fitnessAa: 1,
    fitnessaa: 0.9,
  },

  founder: {
    alleleLabel: "Hypothetical allele A",

    startingAlleleFreq: 0.5,
    populationSize: 20,
    generations: 100,
    yearsPerGeneration: 25,

    enableMutation: false,
    enableGeneFlow: false,
    enableSelection: false,
    enableDrift: true,

    forwardMutationRate: 0,
    reverseMutationRate: 0,

    migrationRate: 0,
    sourceAlleleFreq: 0,
    migrationGenerations: 0,

    fitnessAA: 1,
    fitnessAa: 1,
    fitnessaa: 1,
  },

  altitude: {
    alleleLabel: "EPAS1 adaptive haplotype",

    startingAlleleFreq: 0.05,
    populationSize: 500,
    generations: 150,
    yearsPerGeneration: 25,

    enableMutation: false,
    enableGeneFlow: true,
    enableSelection: true,
    enableDrift: true,

    forwardMutationRate: 0,
    reverseMutationRate: 0,

    migrationRate: 0.05,
    sourceAlleleFreq: 0.6,
    migrationGenerations: 10,

    fitnessAA: 1,
    fitnessAa: 1,
    fitnessaa: 0.9,
  },

  custom: {
    alleleLabel: "Allele A",

    startingAlleleFreq: 0.5,
    populationSize: 100,
    generations: 100,
    yearsPerGeneration: 25,

    enableMutation: false,
    enableGeneFlow: false,
    enableSelection: false,
    enableDrift: true,

    forwardMutationRate: 0,
    reverseMutationRate: 0,

    migrationRate: 0,
    sourceAlleleFreq: 0.5,
    migrationGenerations: 0,

    fitnessAA: 1,
    fitnessAa: 1,
    fitnessaa: 1,
  },
};
