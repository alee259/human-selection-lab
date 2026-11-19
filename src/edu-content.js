// Educational content is separate from the simulation engine.
const educationContent = {
  sickleCell: {
    title: "Sickle Cell & Malaria",
    background:
      "HbS is a variant of the HBB gene. Individuals with two HbS copies can develop sickle-cell disease. In malaria-endemic environments, people with one HbS and one HbA copy have protection against severe malaria, helping maintain HbS despite its costs in homozygotes.",
    mechanism:
      "Balancing selection through heterozygote advantage. In the illustrative preset, HbS/HbA has the highest relative fitness. Selection alone tends toward an intermediate HbS frequency; drift can cause fluctuations around that tendency.",
    prediction:
      "With drift off and the default fitnesses (HbS/HbS = 0.20, HbS/HbA = 1.00, HbA/HbA = 0.89), the model approaches an HbS equilibrium near 0.121. This is a model outcome, not a measured population frequency.",
    caveat:
      "The fitnesses are illustrative, and malaria exposure, medical care, population history, and environmental conditions differ across populations.",
    sources: [
      {
        label:
          "Allison (1954), Protection afforded by sickle-cell trait against subtertian malarial infection",
        url: "https://doi.org/10.1136/bmj.1.4857.290",
      },
    ],
  },

  lactase: {
    title: "Lactase Persistence",
    background:
      "Lactase persistence is the continued production of lactase into adulthood. In some dairying populations, this trait could provide nutritional benefits. The map tracks the European-associated rs4988235 (−13910*T) variant, but other variants can also cause lactase persistence.",
    mechanism:
      "Directional selection can increase a beneficial allele. In the preset, genotypes carrying the tracked allele have greater relative fitness than the other homozygote. The graph demonstrates how its frequency may increase across generations.",
    prediction:
      "Without drift, the preset predicts a smooth increase in the tracked allele frequency. Adding drift introduces random deviations; these are not historical reconstructions of any mapped population.",
    caveat:
      "The preset simplifies a complex gene–culture evolutionary history to one locus with constant fitness. Frequency of rs4988235 is not the same as measured lactose tolerance.",
    sources: [
      {
        label:
          "Itan et al. (2009), The origins of lactase persistence in Europe",
        url: "https://doi.org/10.1371/journal.pcbi.1000491",
      },
    ],
  },

  founder: {
    title: "Founder Effect & Genetic Drift",
    background:
      "When a small group establishes a new population, its allele frequencies may differ by chance from the larger source population. In small populations, random sampling can continue to shift frequencies over generations.",
    mechanism:
      "Genetic drift is random change in allele frequency. This preset models neutral drift in a small, constant-size population; it does not explicitly sample founders from a larger ancestral population.",
    prediction:
      "Repeated runs can differ dramatically. Some lose the tracked allele (frequency 0), others fix it (frequency 1), even when all runs begin at the same frequency.",
    caveat:
      "This is a small-population drift demonstration, not a complete demographic model of a founding event or population bottleneck.",
    sources: [
      {
        label: "Kimura (1968), Evolutionary rate at the molecular level",
        url: "https://doi.org/10.1038/217624a0",
      },
    ],
  },

  altitude: {
    title: "High-Altitude Adaptation & EPAS1",
    background:
      "EPAS1 is involved in responses to oxygen availability. A Tibetan-associated adaptive EPAS1 haplotype shows evidence of Denisovan-related introgression and has risen in frequency in some high-altitude populations.",
    mechanism:
      "The preset combines gene flow, selection, and drift. Gene flow introduces a tracked genetic unit from a source population, while selection changes its frequency based on assigned genotype fitnesses.",
    prediction:
      "The simulated haplotype may rise in frequency when migration introduces it and selection favors its carriers. These illustrative migration rates and fitnesses are not estimates of historical introgression.",
    caveat:
      "The map tracks a defined EPAS1 haplotype, while the simulator treats it as one of two possible genetic units. It does not reconstruct Denisovan admixture, multiple linked variants, or actual Tibetan population history.",
    sources: [
      {
        label:
          "Huerta-Sánchez et al. (2014), Altitude adaptation in Tibetans caused by introgression of Denisovan-like DNA",
        url: "https://doi.org/10.1038/nature13408",
      },
    ],
  },

  custom: {
    title: "Build Your Own Experiment",
    background:
      "Use the controls to explore how allele frequencies respond to different combinations of evolutionary forces. Allele A is simply the tracked genetic unit; it is not necessarily dominant or beneficial.",
    mechanism:
      "Toggle any combination of mutation, gene flow, natural selection, and genetic drift. Each enabled force acts in the fixed order documented below.",
    prediction:
      "Try turning off every force to produce a flat trajectory, then enable one force at a time. Use Run 10 Times to compare random outcomes when drift is active.",
    caveat:
      "A numerical trajectory alone cannot establish which mechanism caused a real population's genetic history. Your settings describe a hypothetical model.",
    sources: [],
  },
};
