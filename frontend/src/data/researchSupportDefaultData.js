/**
 * Default fallback data for Knowledge & Research Support Services (KRSS)
 * Sourced from UMT KRSS & expanded for Lahore Leads University ORIC Research Ecosystem.
 */

export const defaultCategories = [
  {
    id: 'proposal_writing',
    title: 'Writing Effective Research Proposal',
    description: 'Curated slide presentations, annotated sample proposals, and grant writing guides from top universities.',
    badge: '12 Resources (Slides & PDFs)',
    icon: 'FileText'
  },
  {
    id: 'topic_selection',
    title: 'Finalizing Research Topic',
    description: 'Methodological frameworks, doctoral guides, and topic validation strategies to identify novel research gaps.',
    badge: '7 Frameworks & Guides',
    icon: 'Compass'
  },
  {
    id: 'journal_finder',
    title: 'Finding Suitable Journal for Publishing Your Research',
    description: 'AI manuscript matchers and official indexing search engines from Elsevier, Springer, Clarivate, and PubMed.',
    badge: '7 AI Matchers & Tools',
    icon: 'Search'
  },
  {
    id: 'ranking_systems',
    title: 'Journals Ranking System & Impact Metrics',
    description: 'International bibliometric benchmarking portals including Web of Science, Scopus SJR, SNIP, and Eigenfactor.',
    badge: '5 Indexing Platforms',
    icon: 'TrendingUp'
  }
];

export const defaultResearchSupportResources = [
  // ==========================================
  // 1. WRITING EFFECTIVE RESEARCH PROPOSAL
  // ==========================================
  {
    id: 1,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Elements of Research Proposal',
    type: 'slides',
    source: 'SlideShare Academic Series',
    description: 'Comprehensive presentation breaking down the essential structure, hypotheses, literature review, theoretical frameworks, and methodology of competitive academic proposals.',
    url: 'https://www.slideshare.net/guest349908/the-research-proposal',
    tags: 'Proposal Structure, Hypotheses, Methodology, Slides',
    order_index: 1,
    is_active: true
  },
  {
    id: 2,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Quantitative Research Methods in LIS',
    type: 'slides',
    source: 'SlideShare (Dr. Sadaf Batool)',
    description: 'Step-by-step presentation on designing empirical quantitative research, data sampling, survey instrument design, and statistical data modeling.',
    url: 'https://www.slideshare.net/sadafbatool2/research-proposal-presentation-42082802',
    tags: 'Quantitative, Methodology, Survey Design, Data Analysis',
    order_index: 2,
    is_active: true
  },
  {
    id: 3,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Teachers Perception on Assessing Pupils Oral Skills in Rural Primary School',
    type: 'slides',
    source: 'SlideShare (Nani Mamat)',
    description: 'Sample empirical research proposal presentation demonstrating qualitative inquiry, classroom interventions, assessment rubrics, and data triangulation.',
    url: 'https://www.slideshare.net/nanimamat/my-research-proposalppt',
    tags: 'Sample Proposal, Education, Qualitative Study',
    order_index: 3,
    is_active: true
  },
  {
    id: 4,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Preservice Teacher Notions of Families & Schooling',
    type: 'slides',
    source: 'SlideShare (Dr. John McKeown)',
    description: 'Complete academic thesis proposal slide deck with problem statement, research questions, theoretical lenses, and timeline planning.',
    url: 'https://www.slideshare.net/drjohnmckeown/research-project-ppt-4746084?next_slideshow=1',
    tags: 'Thesis Proposal, Problem Statement, Slides',
    order_index: 4,
    is_active: true
  },
  {
    id: 5,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Writing a Successful Proposal Handbook',
    type: 'pdf',
    source: 'Babson College Teaching & Research',
    description: 'Detailed academic handbook on structuring compelling research grant and dissertation proposals with measurable milestones and impact.',
    url: 'https://www.babson.edu/media/babson/assets/teaching-research/writing-a-successful-proposal.pdf',
    tags: 'Grant Writing, Proposal Guide, Babson College, PDF',
    order_index: 5,
    is_active: true
  },
  {
    id: 6,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Writing an Effective Proposal: How and Why',
    type: 'pdf',
    source: 'ResearchGate Publications',
    description: 'Scholarly guide on the rationale, scientific significance, literature gap synthesis, and execution of rigorous proposal writing for high-impact journals.',
    url: 'https://www.researchgate.net/publication/314089405_Writing_an_Effective_Proposal_How_Why',
    tags: 'Academic Writing, ResearchGate, Scientific Significance',
    order_index: 6,
    is_active: true
  },
  {
    id: 7,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'How to Write a Research Proposal for Postgraduates',
    type: 'pdf',
    source: 'ResearchGate Academic Guides',
    description: 'Practical guidelines for MS and PhD scholars on conceptualizing problem statements, research methodology, timeline Gantt charts, and resource budgeting.',
    url: 'https://www.researchgate.net/publication/228490768_HOW_TO_WRITE_A_RESEARCH_PROPOSAL',
    tags: 'Postgraduate, Thesis Proposal, MS/PhD, PDF',
    order_index: 7,
    is_active: true
  },
  {
    id: 8,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Annotated Sample Research Proposal: Process and Product',
    type: 'pdf',
    source: 'University of Queensland (UQ)',
    description: 'Full sample research proposal annotated with peer reviewer commentary, structural breakdown, and evaluator grading criteria.',
    url: 'https://my.uq.edu.au/files/10720/sample-annotated-research-proposal.pdf',
    tags: 'Annotated Sample, Reviewer Comments, UQ, Exemplary Proposal',
    order_index: 8,
    is_active: true
  },
  {
    id: 9,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Sample Research Proposal with Faculty Evaluator Comments',
    type: 'pdf',
    source: 'University of Houston (UH)',
    description: 'Exemplary real-world research proposal featuring detailed margin annotations, critique on methodology, and recommendations for grant approval.',
    url: 'https://www.uh.edu/~lsong5/documents/A%20sample%20proposal%20with%20comment.pdf',
    tags: 'Sample Proposal, Annotations, University of Houston',
    order_index: 9,
    is_active: true
  },
  {
    id: 10,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Ten Top Tips for Successful Proposal Writing',
    type: 'pdf',
    source: 'University of Massachusetts (UMass)',
    description: 'Concise checklist of the ten most vital strategies for grant and academic proposals to maximize peer-review approval and avoid common pitfalls.',
    url: 'http://people.umass.edu/lisact/textbook/Chapter1.pdf',
    tags: 'Top 10 Tips, Proposal Strategy, UMass, Best Practices',
    order_index: 10,
    is_active: true
  },
  {
    id: 11,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Business & Commercial Project Proposal Templates',
    type: 'pdf',
    source: 'Template.net Industry Library',
    description: 'Standard business, corporate, and industry proposal frameworks for venture-backed research initiatives and ORIC commercialization incubator pitches.',
    url: 'https://www.template.net/business/proposal-templates/proposal-examples/',
    tags: 'Commercialization, Industry Proposal, Venture Pitch',
    order_index: 11,
    is_active: true
  },
  {
    id: 12,
    category: 'proposal_writing',
    category_title: 'Writing Effective Research Proposal',
    title: 'Developing Skills of NGOs: Project Proposal Writing Manual',
    type: 'pdf',
    source: 'Regional Environmental Center (REC)',
    description: 'Comprehensive manual for formulating international research project objectives, logical frameworks (logframes), risk mitigation, and milestone deliverables.',
    url: 'http://documents.rec.org/publications/ProposalWriting.pdf',
    tags: 'Logframes, International Grants, Project Manual',
    order_index: 12,
    is_active: true
  },

  // ==========================================
  // 2. FINALIZING RESEARCH TOPIC
  // ==========================================
  {
    id: 13,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'Choosing a Research Topic: Core Concepts',
    type: 'slides',
    source: 'SlideShare (Walsh & DJ)',
    description: 'Slide presentation on identifying unresolved scientific gaps, testing novelty, and aligning topic scope with available laboratory and computational resources.',
    url: 'https://www.slideshare.net/walshandj/choosing-a-research-topic',
    tags: 'Topic Selection, Research Gap, Novelty, Feasibility',
    order_index: 13,
    is_active: true
  },
  {
    id: 14,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'How to Choose a Research Topic: Practical Roadmap',
    type: 'slides',
    source: 'SlideShare (Avinash Advani)',
    description: 'Strategic roadmap for selecting high-impact, publishable topics across engineering, computer science, management, and health disciplines.',
    url: 'https://www.slideshare.net/AvinashAdvani2/how-to-choose-a-research-topic',
    tags: 'Topic Roadmap, Research Strategy, Slides',
    order_index: 14,
    is_active: true
  },
  {
    id: 15,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'Choosing a Research Topic: Methodological Guide',
    type: 'slides',
    source: 'SlideShare (Verzosa F.)',
    description: 'Guide for undergraduate and graduate researchers on formulating clear research questions, scoping literature, and avoiding over-saturated topics.',
    url: 'https://www.slideshare.net/verzosaf/choosing-a-research-topic-53639713',
    tags: 'Narrowing Scope, Formulating Questions, Graduate Guide',
    order_index: 15,
    is_active: true
  },
  {
    id: 16,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'Strategies for Selecting a High-Impact Research Topic',
    type: 'pdf',
    source: 'ResearchGate Academic Publications',
    description: 'Methodology on preliminary literature scoping reviews, systematic citation tree searches, and validating research questions before experimental design.',
    url: 'https://www.researchgate.net/publication/343683240_Strategies_for_Selecting_a_Research_Topic',
    tags: 'Literature Scoping, High-Impact Topics, Validation',
    order_index: 16,
    is_active: true
  },
  {
    id: 17,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'Selecting a Research Topic: Framework for Doctoral Students',
    type: 'pdf',
    source: 'Iowa State University Library',
    description: 'Structured academic framework for doctoral scholars to develop novel theoretical frameworks, bridge interdisciplinary gaps, and produce high-citation dissertations.',
    url: 'https://lib.dr.iastate.edu/cgi/viewcontent.cgi?article=1002&context=scm_pub',
    tags: 'Doctoral Framework, PhD Dissertation, Iowa State',
    order_index: 17,
    is_active: true
  },
  {
    id: 18,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'How to Choose a Research Topic Guide',
    type: 'pdf',
    source: 'Brigham Young University (ISRL)',
    description: 'Methodological framework from the Information Systems Research Lab on topic viability, supervisor expertise matching, and data availability assessment.',
    url: 'https://isrl.byu.edu/wp-content/uploads/2015/05/How-to-Choose-a-Research-Topic.pdf',
    tags: 'BYU ISRL, Research Viability, Data Assessment',
    order_index: 18,
    is_active: true
  },
  {
    id: 19,
    category: 'topic_selection',
    category_title: 'Finalizing Research Topic',
    title: 'How to Select a Research Topic: Scientific Protocol',
    type: 'pdf',
    source: 'Khyber Girls Medical College (KGMC)',
    description: 'Protocol on formulating FINER criteria (Feasible, Interesting, Novel, Ethical, Relevant) research topics in clinical and experimental sciences.',
    url: 'https://www.kgmc.edu.pk/assets/media/3-How-to-select-a-research-topic.pdf',
    tags: 'FINER Criteria, Scientific Protocol, Medical/Science',
    order_index: 19,
    is_active: true
  },

  // ==========================================
  // 3. FINDING SUITABLE JOURNAL FOR PUBLISHING
  // ==========================================
  {
    id: 20,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'Elsevier Journal Finder',
    type: 'tool',
    source: 'Elsevier (Scopus Indexed)',
    description: 'AI-powered journal matching tool. Paste your paper title, abstract, and field of research to instantly match with indexed Elsevier journals with acceptance rates, review speeds, and open-access options.',
    url: 'https://journalfinder.elsevier.com/',
    tags: 'AI Matcher, Scopus, Elsevier, Acceptance Rates, Fast Review',
    order_index: 20,
    is_active: true
  },
  {
    id: 21,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'Springer Journal Suggester',
    type: 'tool',
    source: 'Springer Nature & BioMed Central',
    description: 'Searches across all Springer and BioMed Central peer-reviewed journals to identify the optimal high-impact journal matching your manuscript abstract and keywords.',
    url: 'https://journalsuggester.springer.com/',
    tags: 'Springer, BMC, Journal Selector, SpringerLink, Impact Factor',
    order_index: 21,
    is_active: true
  },
  {
    id: 22,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'EndNote Manuscript Matcher',
    type: 'tool',
    source: 'Clarivate Web of Science (WoS)',
    description: 'Clarivate-backed manuscript matching engine that analyzes your paper references, title, and abstract against Web of Science Core Collection journals to guarantee authentic indexation.',
    url: 'https://endnote.com/product-details/manuscript-matcher/',
    tags: 'Web of Science, Clarivate, EndNote, WoS Master Journal List',
    order_index: 22,
    is_active: true
  },
  {
    id: 23,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'JANE (Journal/Author Name Estimator)',
    type: 'tool',
    source: 'Biosemantics Group / PubMed',
    description: 'Compares your document title or abstract to millions of PubMed articles to locate suitable journals, prospective peer reviewers, and relevant authoritative citations.',
    url: 'https://jane.biosemantics.org/',
    tags: 'PubMed, Biosemantics, Abstract Matcher, Reviewer Finder',
    order_index: 23,
    is_active: true
  },
  {
    id: 24,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'Think. Check. Submit. Portal',
    type: 'tool',
    source: 'International Academic Publishing Coalition',
    description: 'Global initiative providing practical checklists to help authors evaluate journal credibility, verify peer review transparency, and avoid predatory publishers.',
    url: 'https://thinkchecksubmit.org/',
    tags: 'Anti-Predatory, Publishing Ethics, Integrity, Checklists',
    order_index: 24,
    is_active: true
  },
  {
    id: 25,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'FlourishOA (Publish or Flourish Open Access)',
    type: 'tool',
    source: 'FlourishOA Academic Index',
    description: 'Interactive directory for identifying high-value, reputable open access journals with transparent Article Processing Charges (APCs) and ethical publication practices.',
    url: 'http://flourishoa.org/',
    tags: 'Open Access, APCs, High Value, Transparent Fees',
    order_index: 25,
    is_active: true
  },
  {
    id: 26,
    category: 'journal_finder',
    category_title: 'Finding Suitable Journal for Publishing Your Research',
    title: 'Resurchify Journal Impact Portal',
    type: 'tool',
    source: 'Resurchify Academic Database',
    description: 'Comprehensive platform for searching journal impact scores, h-index metrics, overall ranking percentiles, and acceptance statistics across scientific domains.',
    url: 'https://www.resurchify.com/',
    tags: 'Impact Score, H-Index, Journal Metrics, Acceptance Stats',
    order_index: 26,
    is_active: true
  },

  // ==========================================
  // 4. JOURNALS RANKING SYSTEM & METRICS
  // ==========================================
  {
    id: 27,
    category: 'ranking_systems',
    category_title: 'Journals Ranking System & Impact Metrics',
    title: 'Clarivate Analytics (Web of Science / JCR)',
    type: 'metric',
    source: 'Clarivate Web of Science',
    description: 'The international gold-standard for Journal Citation Reports (JCR), official Journal Impact Factor (JIF), and Master Journal List indexing for prestigious publications.',
    url: 'https://clarivate.com/',
    tags: 'Web of Science, JCR, Impact Factor, Master Journal List',
    order_index: 27,
    is_active: true
  },
  {
    id: 28,
    category: 'ranking_systems',
    category_title: 'Journals Ranking System & Impact Metrics',
    title: 'SCImago Journal & Country Rank (SJR)',
    type: 'metric',
    source: 'SCImago / Scopus (Elsevier)',
    description: 'Publicly available bibliometric portal tracking 34,000+ journals and country scientific indicators derived from Scopus with Q1, Q2, Q3, and Q4 quartile classifications.',
    url: 'https://www.scimagojr.com/',
    tags: 'Scopus, SJR, Quartiles Q1-Q4, Country Indicators',
    order_index: 28,
    is_active: true
  },
  {
    id: 29,
    category: 'ranking_systems',
    category_title: 'Journals Ranking System & Impact Metrics',
    title: 'Source-Normalized Impact per Paper (SNIP)',
    type: 'metric',
    source: 'CWTS Leiden University & Scopus',
    description: 'Field-normalized metric measuring contextual citation impact by adjusting for disciplinary differences in citation frequency across diverse subject domains.',
    url: 'https://www.journalindicators.com/',
    tags: 'SNIP, Normalized Citations, Scopus, CWTS Leiden',
    order_index: 29,
    is_active: true
  },
  {
    id: 30,
    category: 'ranking_systems',
    category_title: 'Journals Ranking System & Impact Metrics',
    title: 'The Eigenfactor Score (EFT)',
    type: 'metric',
    source: 'Eigenfactor.org (University of Washington)',
    description: 'Academic prestige metric measuring total journal influence and researcher engagement time, calculated using whole citation network algorithms.',
    url: 'http://www.eigenfactor.org/',
    tags: 'Eigenfactor, Academic Prestige, Citation Network',
    order_index: 30,
    is_active: true
  },
  {
    id: 31,
    category: 'ranking_systems',
    category_title: 'Journals Ranking System & Impact Metrics',
    title: 'Journal Quality Ranking System (JQRS)',
    type: 'metric',
    source: 'Institute of Space Technology / HEC Pakistan',
    description: 'Domain-independent evaluation system helping university decision-makers, ORIC directors, and deans benchmark faculty publication quality and research rewards.',
    url: 'https://jqrs.ist.edu.pk/',
    tags: 'JQRS, University Ranking, HEC Evaluation, ORIC Benchmarking',
    order_index: 31,
    is_active: true
  }
];
