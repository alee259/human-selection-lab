function applyMutation(alleleFreq, forwardMutationRate, reverseMutationRate) {
  return (
    alleleFreq * (1 - reverseMutationRate) +
    (1 - alleleFreq) * forwardMutationRate
  );
}

function applyGeneFlow(alleleFreq, migrationRate, sourceAlleleFreq) {
  return (1 - migrationRate) * alleleFreq + migrationRate * sourceAlleleFreq;
}

function applySelection(alleleFreq, fitnessAA, fitnessAa, fitnessaa) {
  const otherAlleleFreq = 1 - alleleFreq;

  // Hardy-Weinberg genotype frequencies
  const freqAA = alleleFreq * alleleFreq;
  const freqAa = 2 * alleleFreq * otherAlleleFreq;
  const freqaa = otherAlleleFreq * otherAlleleFreq;

  // Average fitness of the population
  const avgFitness =
    freqAA * fitnessAA + freqAa * fitnessAa + freqaa * fitnessaa;

  if (avgFitness === 0) {
    throw new Error("Population fitness cannot be zero.");
  }

  // Frequency of allele A after selection
  const newAlleleFreq =
    (freqAA * fitnessAA + alleleFreq * otherAlleleFreq * fitnessAa) /
    avgFitness;

  return newAlleleFreq;
}

function applyDrift(alleleFreq, populationSize) {
  const totalAlleles = 2 * populationSize;
  let alleleACount = 0;

  for (let i = 0; i < totalAlleles; i++) {
    if (Math.random() < alleleFreq) {
      alleleACount++;
    }
  }
  return alleleACount / totalAlleles;
}

function runSimulation(settings) {
  let currentAlleleFreq = settings.startingAlleleFreq;

  // Store generation 0
  const results = [currentAlleleFreq];

  for (let generation = 1; generation <= settings.generations; generation++) {
    // Step 1: Mutation
    if (settings.enableMutation) {
      currentAlleleFreq = applyMutation(
        currentAlleleFreq,
        settings.forwardMutationRate,
        settings.reverseMutationRate,
      );
    }

    // Step 2: Gene flow
    if (
      settings.enableGeneFlow &&
      generation <= settings.migrationGenerations
    ) {
      currentAlleleFreq = applyGeneFlow(
        currentAlleleFreq,
        settings.migrationRate,
        settings.sourceAlleleFreq,
      );
    }

    // Step 3: Natural selection
    if (settings.enableSelection) {
      currentAlleleFreq = applySelection(
        currentAlleleFreq,
        settings.fitnessAA,
        settings.fitnessAa,
        settings.fitnessaa,
      );
    }

    // Step 4: Genetic drift
    if (settings.enableDrift) {
      currentAlleleFreq = applyDrift(
        currentAlleleFreq,
        settings.populationSize,
      );
    }

    // Record the frequency after each generation
    results.push(currentAlleleFreq);
  }

  return results;
}
