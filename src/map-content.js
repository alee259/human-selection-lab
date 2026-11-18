const mapContent = {
  hbs: {
    title: "HbS — Sickle-Cell Allele",

    populations:
      "These five African populations were selected because " +
      "comparable HbS carrier counts are available from " +
      "1000 Genomes reference samples. They provide " +
      "geographic comparisons across West and East Africa. " +
      "They are not a representative sample of all African populations.",

    history:
      "HbS is associated with resistance to severe malaria " +
      "in heterozygous individuals. This advantage can help " +
      "maintain the allele despite the harmful effects of " +
      "sickle-cell disease in homozygotes. Genetic research " +
      "supports an ancient African origin, but the exact " +
      "geographic birthplace remains uncertain.",

    limitations:
      "Frequencies were calculated from reported carrier " +
      "counts in specific samples. They are not national " +
      "prevalence estimates. The map does not establish " +
      "the historical origin of HbS or reconstruct its spread.",

    source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5985360/",
  },

  lactase: {
    title: "Lactase Persistence — rs4988235",

    populations:
      "These five 1000 Genomes reference populations were " +
      "selected because they have comparable measurements " +
      "of the same -13910*T allele. They illustrate variation " +
      "across European-ancestry samples, including a " +
      "population sampled in Utah.",

    history:
      "The -13910*T variant is associated with continued " +
      "lactase production into adulthood. Its frequency " +
      "increased under selection in parts of Europe, " +
      "potentially associated with dairying practices. " +
      "Its exact mutation origin is uncertain. " +
      "Other populations have different genetic variants " +
      "that can also produce lactase persistence.",

    limitations:
      "This dataset measures one genetic variant, not " +
      "the percentage of lactose-tolerant individuals. " +
      "The Utah sample represents individuals with " +
      "European ancestry, not all Utah residents. " +
      "The displayed populations are not a global sample.",

    source: "https://doi.org/10.1371/journal.pcbi.1000491",
  },

  epas1: {
    title: "EPAS1 — High-Altitude Adaptation",

    populations:
      "These four Asian populations were selected because " +
      "published measurements are available for a defined " +
      "EPAS1 adaptive five-motif haplotype. They allow " +
      "comparisons among Tibetan, Sherpa, Deng, and Han " +
      "samples using the same genetic unit.",

    history:
      "The Tibetan-associated EPAS1 adaptive haplotype " +
      "has evidence of Denisovan-related introgression. " +
      "Natural selection subsequently increased its " +
      "frequency in populations living at high altitude. " +
      "The exact geographic location of the ancient " +
      "introgression event remains unknown.",

    limitations:
      "The tracked genetic unit is a haplotype, not a " +
      "single SNP. Marker positions are approximate, " +
      "and the observed frequencies do not represent " +
      "every individual in these populations. " +
      "The simulation treats the haplotype as one " +
      "tracked genetic unit in a simplified model.",

    source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10584363/",
  },
};
