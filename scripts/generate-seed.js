const fs = require('fs');
const path = require('path');

const rawWeeks = [
  {
    weekNumber: 1,
    title: 'LLM Fundamentals',
    description: 'Master the core mechanics of LLMs, tokenization, embeddings, and attention.',
    deliverable: 'A working TypeScript chatbot with conversation history and error handling.',
    objective: 'Understand model architecture, token economics, and direct API communication.',
    topics: ['Tokenization', 'Vector Embeddings', 'Attention Mechanism', 'Context Windows', 'API Integrations'],
    reviewChecklist: [
      'Can calculate token counts and costs accurately',
      'Explain embedding dimensionality and cosine similarity',
      'Successfully run local TypeScript chatbot calling LLM API',
      'Handle API rate limits and connection retries cleanly'
    ],
    days: [
      {
        dayNumber: 1,
        title: 'Environment setup, repo creation and first API call',
        description: 'Initialize the monorepo, set up TypeScript, configure environment variables, and make the first streaming API call.',
        objectives: ['Set up Node/TypeScript environment', 'Configure secure API key storage', 'Implement first API completion call'],
        topics: ['Node.js', 'TypeScript', 'dotenv', 'OpenAI/Anthropic SDK'],
        tasks: [
          { title: 'Initialize project git repository and tsconfig', priority: 'high' },
          { title: 'Configure environment variables with validation', priority: 'medium' },
          { title: 'Write script to make first LLM API call and print response', priority: 'high' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tokens, tokenisation and context windows',
        description: 'Deep dive into BPE tokenization, token counting, context length limits, and sliding window strategies.',
        objectives: ['Understand Byte-Pair Encoding', 'Measure token consumption per prompt', 'Implement context truncation'],
        topics: ['tiktoken', 'BPE algorithm', 'Context window management'],
        tasks: [
          { title: 'Install tiktoken and inspect token ids for sample texts', priority: 'medium' },
          { title: 'Implement a token counter helper for chat messages', priority: 'high' },
          { title: 'Build a safe context window trimmer when approaching limits', priority: 'medium' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Embeddings and vector representations',
        description: 'Explore text embeddings, semantic similarity, cosine distance, and vector clustering.',
        objectives: ['Generate embeddings using embedding models', 'Compute cosine similarity between text vectors', 'Build semantic search function'],
        topics: ['Text embeddings', 'Cosine similarity', 'Vector geometry'],
        tasks: [
          { title: 'Generate embeddings for 10 diverse sentences', priority: 'medium' },
          { title: 'Implement cosine similarity mathematical function', priority: 'high' },
          { title: 'Build interactive semantic search CLI over a local text list', priority: 'high' }
        ]
      },
      {
        dayNumber: 4,
        title: 'Transformer architecture and attention',
        description: 'Understand self-attention, query/key/value projections, multi-head attention, and feedforward networks.',
        objectives: ['Demystify scaled dot-product attention', 'Understand autoregressive decoding', 'Analyze model parameter counts'],
        topics: ['Self-attention', 'QKV matrices', 'Autoregressive generation'],
        tasks: [
          { title: 'Study the Attention Is All You Need diagram and write summary notes', priority: 'medium' },
          { title: 'Implement a simplified self-attention calculation in TypeScript', priority: 'high' },
          { title: 'Document temperature, top_p, and frequency penalty mechanics', priority: 'medium' }
        ]
      },
      {
        dayNumber: 5,
        title: 'Build a basic TypeScript chatbot',
        description: 'Construct a command-line interactive chat application with streaming responses.',
        objectives: ['Stream LLM tokens in real-time to stdout', 'Handle readline user input in an event loop', 'Manage system prompt injection'],
        topics: ['Streaming API', 'ReadableStream', 'CLI UX'],
        tasks: [
          { title: 'Set up readline interface for continuous terminal chat', priority: 'medium' },
          { title: 'Implement server-sent events / streaming token rendering', priority: 'high' },
          { title: 'Add system prompt personality configuration', priority: 'medium' }
        ]
      },
      {
        dayNumber: 6,
        title: 'Add conversation history and error handling',
        description: 'Maintain multi-turn conversation state, exponential backoff on 429/500 errors, and graceful disconnects.',
        objectives: ['Implement in-memory conversation buffer', 'Add retry logic with exponential backoff', 'Format role messages (system, user, assistant)'],
        topics: ['Chat history state', 'Exponential backoff', 'Error resilience'],
        tasks: [
          { title: 'Create conversation history manager with sliding window', priority: 'high' },
          { title: 'Implement retry handler with jitter for rate limits', priority: 'high' },
          { title: 'Add /clear and /history CLI commands', priority: 'low' }
        ]
      },
      {
        dayNumber: 7,
        title: 'Review, test, document and retrospective',
        description: 'Write unit tests for token counting and history management, document the week 1 project, and record takeaways.',
        objectives: ['Test chatbot edge cases', 'Publish week 1 repo README with architecture diagram', 'Conduct weekly retrospective'],
        topics: ['Testing', 'Documentation', 'Retrospective'],
        tasks: [
          { title: 'Write tests for history truncation and retry backoff', priority: 'medium' },
          { title: 'Draft project README and usage guide', priority: 'high' },
          { title: 'Complete Week 1 journal entry with lessons learned', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 2,
    title: 'Prompt Engineering and Tool Calling',
    description: 'Master system prompts, structured JSON outputs, function calling, and schema validation.',
    deliverable: 'A structured tool-calling agent with arithmetic and data lookup tools.',
    objective: 'Implement reliable schema-driven tool execution with Zod validation and error retries.',
    topics: ['System Prompts', 'Structured Outputs', 'Function Calling', 'Zod Schemas', 'Argument Validation'],
    reviewChecklist: [
      'Model reliably emits valid JSON adhering to Zod schemas',
      'Tool execution loop handles malformed tool arguments gracefully',
      'Multi-step tool calling executes until stop condition',
      'Thorough test coverage on tool parameter parsing'
    ],
    days: [
      {
        dayNumber: 8,
        title: 'System prompts and prompt design',
        description: 'Explore few-shot prompting, chain-of-thought, delimiter tags, and system constraints.',
        objectives: ['Formulate robust system instructions', 'Benchmark few-shot vs zero-shot', 'Implement XML/Markdown structured prompting'],
        topics: ['System design', 'Few-shot', 'Chain-of-thought'],
        tasks: [
          { title: 'Create prompt template library with dynamic variable interpolation', priority: 'medium' },
          { title: 'Test edge cases where models hallucinate guidelines and patch prompt', priority: 'high' }
        ]
      },
      {
        dayNumber: 9,
        title: 'Structured outputs and Zod schemas',
        description: 'Force model responses into strict JSON schemas using response_format and Zod.',
        objectives: ['Enforce JSON schema outputs', 'Parse and validate LLM JSON output with Zod', 'Handle schema mismatch errors'],
        topics: ['Zod', 'Structured Outputs', 'JSON Schema'],
        tasks: [
          { title: 'Define strict Zod schema for structured research summaries', priority: 'high' },
          { title: 'Configure LLM structured output mode with schema enforcement', priority: 'high' },
          { title: 'Write test suite validating 10 complex model responses', priority: 'medium' }
        ]
      },
      {
        dayNumber: 10,
        title: 'Tool definitions and tool-call lifecycle',
        description: 'Understand the tool call protocol: definition, model tool choice, tool execution, and tool response message.',
        objectives: ['Map TypeScript functions to OpenAI/Anthropic tool schemas', 'Understand tool_call_id correlation', 'Handle multiple tool calls'],
        topics: ['Tool schema', 'Function definitions', 'Tool message protocol'],
        tasks: [
          { title: 'Build tool registry converting Zod schemas to JSON Schema format', priority: 'high' },
          { title: 'Verify tool definition serialization and documentation strings', priority: 'medium' }
        ]
      },
      {
        dayNumber: 11,
        title: 'Implement calculator tool',
        description: 'Build safe arithmetic, algebraic expression evaluation, and unit conversion tools.',
        objectives: ['Create sandboxed math evaluation tool', 'Prevent code injection in math parser', 'Format clear calculation trace for model'],
        topics: ['Sandboxed execution', 'Math expressions', 'Safe evaluation'],
        tasks: [
          { title: 'Implement safe calculator tool with validation', priority: 'high' },
          { title: 'Write unit tests for math operations and edge cases', priority: 'medium' }
        ]
      },
      {
        dayNumber: 12,
        title: 'Implement tool-calling loop',
        description: 'Create an autonomous loop: send prompt -> parse tool calls -> execute functions -> return tool results -> repeat until final answer.',
        objectives: ['Write iterative agent loop', 'Support sequential and parallel tool calls', 'Terminate when finish_reason is stop'],
        topics: ['Agent loop', 'Tool dispatch', 'Iteration control'],
        tasks: [
          { title: 'Implement core tool-calling execution cycle', priority: 'high' },
          { title: 'Add maximum turn iteration guard to prevent infinite loops', priority: 'high' }
        ]
      },
      {
        dayNumber: 13,
        title: 'Validation, retries and malformed arguments',
        description: 'Handle cases where the LLM passes invalid arguments: catch Zod validation error, return error to LLM, and prompt for correction.',
        objectives: ['Implement tool reflection on error', 'Send corrective feedback messages', 'Benchmark recovery success rate'],
        topics: ['Self-correction', 'Error feedback loop', 'Defensive programming'],
        tasks: [
          { title: 'Build error feedback mechanism returning Zod errors to assistant', priority: 'high' },
          { title: 'Verify LLM recovers from intentional schema mismatches', priority: 'medium' }
        ]
      },
      {
        dayNumber: 14,
        title: 'Tests, README and retrospective',
        description: 'Package the tool calling engine, write documentation, clean up code, and document week 2 learnings.',
        objectives: ['Full test coverage for tool calling engine', 'Publish comprehensive README', 'Reflect on prompt engineering techniques'],
        topics: ['Unit testing', 'Documentation', 'Retrospective'],
        tasks: [
          { title: 'Write integration tests with mocked LLM tool calls', priority: 'high' },
          { title: 'Write Week 2 retrospective journal entry', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 3,
    title: 'Agent Loops',
    description: 'Build autonomous agent loops with ReAct (Reason + Act), planning, bounded execution, and observation handling.',
    deliverable: 'Autonomous research agent with step-by-step reasoning traces and stop conditions.',
    objective: 'Implement robust ReAct agent architecture with explicit observation states and telemetry.',
    topics: ['ReAct Pattern', 'Task Planning', 'Observation Loops', 'Bounded Execution', 'Execution Tracing'],
    reviewChecklist: [
      'Agent decomposes complex multi-step queries into sub-tasks',
      'Observations are formatted cleanly into context',
      'Strict execution limits (max steps, timeout, cost) prevent runaway loops',
      'Complete execution trace logging'
    ],
    days: [
      {
        dayNumber: 15,
        title: 'Agent loop fundamentals',
        description: 'Understand the ReAct pattern: Thought -> Action -> Observation -> Thought -> Final Answer.',
        objectives: ['Deconstruct the ReAct paradigm', 'Contrast single-turn vs multi-step agents', 'Implement thought parsing'],
        topics: ['ReAct framework', 'Cognitive architectures', 'Agent loops'],
        tasks: [
          { title: 'Write state machine diagram for ReAct agent', priority: 'medium' },
          { title: 'Implement core state machine data structures in TypeScript', priority: 'high' }
        ]
      },
      {
        dayNumber: 16,
        title: 'Planning and task decomposition',
        description: 'Teach the agent to generate an initial plan, break tasks down into checkpoints, and update plan dynamically.',
        objectives: ['Implement planning phase before tool execution', 'Track plan step completion', 'Allow plan revision on unexpected observations'],
        topics: ['Hierarchical planning', 'Task decomposition', 'Plan adaptation'],
        tasks: [
          { title: 'Build plan generation prompt generating structured step lists', priority: 'high' },
          { title: 'Integrate active step cursor in agent state', priority: 'medium' }
        ]
      },
      {
        dayNumber: 17,
        title: 'Tool selection and observations',
        description: 'Design informative observation messages that guide the model toward the next logical step.',
        objectives: ['Format structured observations', 'Truncate verbose tool outputs', 'Provide contextual hints on partial progress'],
        topics: ['Observation formatting', 'Information density', 'Context budgeting'],
        tasks: [
          { title: 'Create observation summarizer for large tool responses', priority: 'medium' },
          { title: 'Test agent tool selection accuracy across 15 ambiguous scenarios', priority: 'high' }
        ]
      },
      {
        dayNumber: 18,
        title: 'Build research-agent skeleton',
        description: 'Implement a multi-tool research agent with search, page fetch, summarization, and synthesis.',
        objectives: ['Assemble research agent pipeline', 'Connect search and web scraper tools', 'Produce synthesized research markdown report'],
        topics: ['Web scraping', 'Search integration', 'Markdown synthesis'],
        tasks: [
          { title: 'Wire mock search and web fetch tools to agent', priority: 'high' },
          { title: 'Run multi-step query requiring 4 interconnected search steps', priority: 'high' }
        ]
      },
      {
        dayNumber: 19,
        title: 'Bounded execution and stopping rules',
        description: 'Set hard boundaries: maximum steps, token budgets, timeout limits, and explicit user-abort triggers.',
        objectives: ['Implement timeout cancellation token', 'Track cumulative token expenditure', 'Define clear termination conditions'],
        topics: ['AbortController', 'Budget limits', 'Guardrails'],
        tasks: [
          { title: 'Add AbortSignal support across all agent async operations', priority: 'high' },
          { title: 'Enforce maxStep limit with graceful partial-result fallback', priority: 'medium' }
        ]
      },
      {
        dayNumber: 20,
        title: 'Traces and tool failure handling',
        description: 'Log every step of the agent run into an inspectable timeline; handle network timeouts and degraded tool states.',
        objectives: ['Create structured execution trace schema', 'Visualize agent steps in terminal or JSON', 'Implement fallback tools on primary failure'],
        topics: ['Telemetry', 'Trace logging', 'Graceful degradation'],
        tasks: [
          { title: 'Build execution tracer emitting JSONL event log', priority: 'high' },
          { title: 'Test recovery when external search tool returns 503 error', priority: 'medium' }
        ]
      },
      {
        dayNumber: 21,
        title: 'Edge-case testing and retrospective',
        description: 'Stress-test the research agent on circular reasoning traps, dead ends, and ambiguous goals.',
        objectives: ['Evaluate agent on loop detection', 'Verify cost accounting', 'Document week 3 progress'],
        topics: ['Stress testing', 'Loop detection', 'Retrospective'],
        tasks: [
          { title: 'Implement duplicate action loop detection heuristic', priority: 'high' },
          { title: 'Publish week 3 code and write journal reflection', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 4,
    title: 'State and Memory',
    description: 'Design persistent conversation storage, session management, vector-backed recall, and context summarization.',
    deliverable: 'Persistent memory layer with PostgreSQL/SQLite, conversation summarization, and key-value recall.',
    objective: 'Implement short-term, working, and long-term memory systems for AI agents.',
    topics: ['Session Management', 'Relational State', 'Conversation Summarization', 'Entity Memory', 'State Machines'],
    reviewChecklist: [
      'Clean separation between ephemeral working state and persistent memory',
      'Automated background summarization preserves essential context across long sessions',
      'Entity facts extracted and recalled accurately',
      'Database transaction safety across message batches'
    ],
    days: [
      {
        dayNumber: 22,
        title: 'State, session and memory concepts',
        description: 'Analyze short-term context window vs long-term persistent memory; architecture of memory layers.',
        objectives: ['Differentiate episodic, semantic, and procedural memory in agents', 'Design memory data contracts'],
        topics: ['Memory taxonomy', 'Episodic memory', 'Context budgeting'],
        tasks: [
          { title: 'Design memory schema covering sessions, messages, and facts', priority: 'high' },
          { title: 'Benchmark latency of in-memory vs persisted memory lookup', priority: 'medium' }
        ]
      },
      {
        dayNumber: 23,
        title: 'PostgreSQL setup and schema design',
        description: 'Create database tables for users, sessions, message history, tool events, and user preferences.',
        objectives: ['Write SQL migration for conversation store', 'Create indexed query paths for session retrieval'],
        topics: ['PostgreSQL / SQLite', 'Schema migrations', 'Relational indexing'],
        tasks: [
          { title: 'Define migrations for sessions and messages tables', priority: 'high' },
          { title: 'Implement database connection pool and seed test data', priority: 'medium' }
        ]
      },
      {
        dayNumber: 24,
        title: 'Persist conversations and messages',
        description: 'Save every user and assistant interaction, metadata, and token usage into the database.',
        objectives: ['Implement repository pattern for chat persistence', 'Maintain message ordering and timestamps'],
        topics: ['Repository pattern', 'Message persistence', 'Metadata tracking'],
        tasks: [
          { title: 'Build MessageRepository with saveMessage and getSessionHistory', priority: 'high' },
          { title: 'Store token usage and cost metrics per message', priority: 'medium' }
        ]
      },
      {
        dayNumber: 25,
        title: 'Conversation history retrieval',
        description: 'Build smart retrieval queries: fetch recent N messages, filter system prompts, and format for API calls.',
        objectives: ['Efficient history pagination', 'Window-based message retrieval', 'Cache active session headers'],
        topics: ['Pagination', 'History formatting', 'In-memory caching'],
        tasks: [
          { title: 'Implement sliding window history fetcher with token threshold', priority: 'high' },
          { title: 'Write tests for session isolation and concurrency', priority: 'medium' }
        ]
      },
      {
        dayNumber: 26,
        title: 'Conversation summarisation',
        description: 'Automatically condense old messages into a running summary when token budget threshold is exceeded.',
        objectives: ['Build progressive summarizer', 'Inject running summary into system prompt', 'Preserve key decisions and facts'],
        topics: ['Progressive summarization', 'Context compaction', 'Information density'],
        tasks: [
          { title: 'Implement summarizeConversation function when history exceeds 4000 tokens', priority: 'high' },
          { title: 'Verify summary retains critical facts from early in dialogue', priority: 'high' }
        ]
      },
      {
        dayNumber: 27,
        title: 'Persistent memory retrieval',
        description: 'Extract explicit user facts (e.g., preferences, tech stack, project goals) and recall them during reasoning.',
        objectives: ['Implement entity fact extractor', 'Build fact recall tool for agent', 'Update facts on conflicting information'],
        topics: ['Entity extraction', 'Key-value recall', 'Memory consolidation'],
        tasks: [
          { title: 'Build background fact extractor analyzing user statements', priority: 'high' },
          { title: 'Inject relevant user facts into agent system prompt', priority: 'medium' }
        ]
      },
      {
        dayNumber: 28,
        title: 'Isolation tests and retrospective',
        description: 'Run multi-user session isolation tests, verify memory persistence across restarts, and conduct retrospective.',
        objectives: ['Validate zero state leakage across sessions', 'Clean up code and write comprehensive docs'],
        topics: ['Session isolation', 'Regression tests', 'Retrospective'],
        tasks: [
          { title: 'Run automated concurrent session isolation test suite', priority: 'high' },
          { title: 'Complete Week 4 journal and document memory architecture', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 5,
    title: 'RAG (Retrieval-Augmented Generation)',
    description: 'Build production document ingestion, smart chunking, vector embeddings, pgvector retrieval, and grounded synthesis.',
    deliverable: 'Complete RAG system answering technical queries with source citations and similarity scores.',
    objective: 'Implement end-to-end vector retrieval pipeline with accurate citations and evaluation.',
    topics: ['Document Ingestion', 'Semantic Chunking', 'Vector Databases', 'pgvector', 'Source Grounding'],
    reviewChecklist: [
      'Document chunking preserves code blocks and semantic headers',
      'pgvector HNSW index configured with cosine distance',
      'Grounded prompt ensures model cites chunk IDs accurately',
      'Retrieval MRR and recall evaluated across benchmark queries'
    ],
    days: [
      {
        dayNumber: 29,
        title: 'RAG architecture and document ingestion',
        description: 'Understand naive vs advanced RAG; build multi-format document parser for markdown, PDF, and code files.',
        objectives: ['Map the RAG lifecycle', 'Parse markdown and code files with metadata extraction'],
        topics: ['RAG architecture', 'Document loaders', 'Metadata tagging'],
        tasks: [
          { title: 'Create document loader for markdown documentation files', priority: 'high' },
          { title: 'Extract title, headers, and relative path metadata', priority: 'medium' }
        ]
      },
      {
        dayNumber: 30,
        title: 'Chunking strategies',
        description: 'Compare fixed-size, sentence-based, recursive character, and markdown header-aware chunking.',
        objectives: ['Implement recursive chunker with overlap', 'Preserve semantic context in code blocks'],
        topics: ['Recursive chunking', 'Overlap ratios', 'Markdown splitter'],
        tasks: [
          { title: 'Build header-aware markdown text splitter in TypeScript', priority: 'high' },
          { title: 'Benchmark chunk size impact on answer completeness', priority: 'medium' }
        ]
      },
      {
        dayNumber: 31,
        title: 'Embeddings and vector search',
        description: 'Batch compute embeddings for document chunks and build in-memory vector index with cosine similarity.',
        objectives: ['Implement batched embedding generation with rate limit handling', 'Compute top-K cosine matches'],
        topics: ['Vector embeddings', 'Batch processing', 'Top-K search'],
        tasks: [
          { title: 'Create batch embedding processor with concurrency control', priority: 'high' },
          { title: 'Build fast in-memory vector store with cosine ranking', priority: 'medium' }
        ]
      },
      {
        dayNumber: 32,
        title: 'Set up pgvector',
        description: 'Install and configure pgvector in PostgreSQL; create vector column and HNSW index.',
        objectives: ['Create table with vector(1536) column', 'Configure HNSW index parameters (m, ef_construction)', 'Execute vector similarity queries'],
        topics: ['pgvector', 'HNSW indexing', 'SQL vector queries'],
        tasks: [
          { title: 'Write SQL migration enabling pgvector extension and table', priority: 'high' },
          { title: 'Test HNSW index creation and query latency on 10,000 vectors', priority: 'high' }
        ]
      },
      {
        dayNumber: 33,
        title: 'Build document retrieval pipeline',
        description: 'Implement hybrid search query: combine vector similarity with keyword/metadata filtering.',
        objectives: ['Implement metadata filtering on vector queries', 'Tune similarity score thresholds'],
        topics: ['Hybrid search', 'Score thresholding', 'Query pipeline'],
        tasks: [
          { title: 'Build retriever class supporting category filtering and topK', priority: 'high' },
          { title: 'Implement deduplication of overlapping document chunks', priority: 'medium' }
        ]
      },
      {
        dayNumber: 34,
        title: 'Grounded answers and source references',
        description: 'Synthesize LLM answers strictly from retrieved chunks with inline citations and reference links.',
        objectives: ['Formulate grounded answer prompt', 'Format citations as clickable references', 'Add fallback response when context is insufficient'],
        topics: ['Source grounding', 'Citation extraction', 'Hallucination prevention'],
        tasks: [
          { title: 'Create synthesis prompt enforcing citations like [Doc 1]', priority: 'high' },
          { title: 'Parse and validate citations in generated answers', priority: 'high' }
        ]
      },
      {
        dayNumber: 35,
        title: 'Retrieval tests and retrospective',
        description: 'Build test dataset of 20 Q&A pairs; evaluate retrieval accuracy, latency, and hallucination rate.',
        objectives: ['Measure retrieval precision and recall', 'Document RAG pipeline', 'Reflect on chunking tradeoffs'],
        topics: ['Evaluation metrics', 'Retrieval precision', 'Retrospective'],
        tasks: [
          { title: 'Run automated evaluation over 20 test questions', priority: 'high' },
          { title: 'Write Week 5 retrospective journal entry', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 6,
    title: 'Agent Orchestration',
    description: 'Design deterministic workflow state machines, sequential & parallel execution, checkpointing, and human-in-the-loop approvals.',
    deliverable: 'A resilient workflow orchestration engine with graph state, checkpointing, and approval pauses.',
    objective: 'Implement state machine orchestrators capable of complex branching and recovery.',
    topics: ['State Machines', 'Graph Orchestration', 'Checkpointing', 'Parallel Branches', 'Human-in-the-Loop'],
    reviewChecklist: [
      'State transitions are deterministic and typed',
      'Workflow can be serialized to disk and resumed at any checkpoint',
      'Parallel branch execution aggregates cleanly without race conditions',
      'Human approval gates pause and resume reliably'
    ],
    days: [
      {
        dayNumber: 36,
        title: 'Workflow state machines',
        description: 'Design directed workflow graphs with nodes (actions), edges (transitions), and shared state.',
        objectives: ['Model agent execution as a state graph', 'Define strongly-typed state transitions'],
        topics: ['Finite State Machines', 'Graph theory', 'Workflow architecture'],
        tasks: [
          { title: 'Define WorkflowGraph interface with Node, Edge, and State', priority: 'high' },
          { title: 'Implement simple linear 3-node execution graph', priority: 'medium' }
        ]
      },
      {
        dayNumber: 37,
        title: 'Sequential orchestration',
        description: 'Build sequential pipelines where output of one specialist agent feeds into the input of the next.',
        objectives: ['Implement sequential pipeline executor', 'Pass typed state across pipeline stages'],
        topics: ['Pipelines', 'State transformation', 'Sequential workflows'],
        tasks: [
          { title: 'Build 3-stage pipeline: Outline -> Draft -> Review', priority: 'high' },
          { title: 'Add schema validation between pipeline stages', priority: 'medium' }
        ]
      },
      {
        dayNumber: 38,
        title: 'Parallel execution',
        description: 'Execute independent sub-tasks concurrently using Promise.allSettled and merge results.',
        objectives: ['Spawn concurrent worker tasks', 'Merge branch state cleanly', 'Handle partial failures in branches'],
        topics: ['Concurrency', 'Fan-out / Fan-in', 'State merging'],
        tasks: [
          { title: 'Implement parallel fan-out node evaluating 3 search angles', priority: 'high' },
          { title: 'Build synthesizer node merging 3 concurrent outputs', priority: 'high' }
        ]
      },
      {
        dayNumber: 39,
        title: 'Checkpointing and persistence',
        description: 'Persist state snapshot at every node boundary to allow resuming interrupted workflows.',
        objectives: ['Serialize workflow state graph to database', 'Implement resumeFromCheckpoint function'],
        topics: ['Checkpointing', 'State serialization', 'Idempotency'],
        tasks: [
          { title: 'Build CheckpointManager saving graph state after each step', priority: 'high' },
          { title: 'Simulate process crash and resume execution from last checkpoint', priority: 'high' }
        ]
      },
      {
        dayNumber: 40,
        title: 'Retries, timeouts and recovery',
        description: 'Add circuit breaker patterns, configurable node retries, and fallback transition paths.',
        objectives: ['Add per-node retry policy with exponential backoff', 'Define fallback dead-letter transition'],
        topics: ['Circuit breakers', 'Fault tolerance', 'Error boundaries'],
        tasks: [
          { title: 'Implement retry handler with custom retry conditions', priority: 'high' },
          { title: 'Add timeout budget per graph node', priority: 'medium' }
        ]
      },
      {
        dayNumber: 41,
        title: 'Human approval workflow',
        description: 'Create pause-for-approval gates: agent pauses execution, emits approval request, and waits for human input.',
        objectives: ['Implement interruptible state node', 'Build approval submission API', 'Resume execution upon approval/rejection'],
        topics: ['Human-in-the-loop', 'Interrupts', 'Approval workflows'],
        tasks: [
          { title: 'Build human approval node requiring CLI confirmation before proceeding', priority: 'high' },
          { title: 'Handle rejection with alternative revision flow', priority: 'medium' }
        ]
      },
      {
        dayNumber: 42,
        title: 'Compare orchestration approaches and retrospective',
        description: 'Compare code-based graphs vs declarative configs; document architecture and record learnings.',
        objectives: ['Benchmark graph execution overhead', 'Document orchestration design patterns', 'Weekly retrospective'],
        topics: ['Architecture comparison', 'Documentation', 'Retrospective'],
        tasks: [
          { title: 'Write comparative review of LangGraph vs custom state machines', priority: 'medium' },
          { title: 'Publish Week 6 retrospective journal entry', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 7,
    title: 'Model Context Protocol (MCP)',
    description: 'Learn Anthropic MCP protocol, build standard MCP servers in TypeScript, expose tools & resources, and connect MCP clients.',
    deliverable: 'A custom Model Context Protocol server and client exposing development tools and file resources.',
    objective: 'Implement standardized client-server tool and resource sharing using MCP specification.',
    topics: ['MCP Specification', 'JSON-RPC 2.0', 'MCP Server SDK', 'Resources & Prompts', 'Security Boundaries'],
    reviewChecklist: [
      'MCP server conforms to official protocol specification',
      'Tools expose clean JSON schemas and descriptions',
      'Resources provide read-only file content and context',
      'Security boundaries prevent unauthorized system operations'
    ],
    days: [
      {
        dayNumber: 43,
        title: 'MCP architecture and concepts',
        description: 'Understand Model Context Protocol: hosts, clients, servers, transports (stdio, SSE), and protocol messages.',
        objectives: ['Study MCP specification overview', 'Understand stdio vs HTTP/SSE transport modes'],
        topics: ['MCP protocol', 'JSON-RPC', 'Transport layers'],
        tasks: [
          { title: 'Read MCP architecture spec and write summary notes', priority: 'medium' },
          { title: 'Inspect raw JSON-RPC messages between client and server', priority: 'medium' }
        ]
      },
      {
        dayNumber: 44,
        title: 'MCP TypeScript SDK setup',
        description: 'Install @modelcontextprotocol/sdk, configure stdio transport, and initialize server instance.',
        objectives: ['Initialize MCP server with name and version', 'Set up server lifecycle and error handlers'],
        topics: ['MCP SDK', 'Server lifecycle', 'Stdio transport'],
        tasks: [
          { title: 'Create new project with @modelcontextprotocol/sdk', priority: 'high' },
          { title: 'Implement basic server ping/handshake handling', priority: 'medium' }
        ]
      },
      {
        dayNumber: 45,
        title: 'Build first MCP tool',
        description: 'Expose filesystem exploration and code search tools via MCP ListTools and CallTool handlers.',
        objectives: ['Define tools with inputSchema using Zod', 'Handle CallToolRequest and return CallToolResult'],
        topics: ['MCP Tools', 'Tool handlers', 'Input schemas'],
        tasks: [
          { title: 'Implement directory listing tool conforming to MCP tool spec', priority: 'high' },
          { title: 'Implement file reading tool with line-range slicing', priority: 'high' }
        ]
      },
      {
        dayNumber: 46,
        title: 'Add resources and prompts',
        description: 'Implement MCP Resources (dynamic data URIs) and Prompts (reusable parameterized prompt templates).',
        objectives: ['Implement ListResources and ReadResource handlers', 'Define dynamic prompt templates'],
        topics: ['MCP Resources', 'MCP Prompts', 'URI schemes'],
        tasks: [
          { title: 'Expose project git status as an MCP resource URI', priority: 'high' },
          { title: 'Create reusable code-review prompt template via MCP', priority: 'medium' }
        ]
      },
      {
        dayNumber: 47,
        title: 'Connect MCP client',
        description: 'Build an MCP client that launches the server child process, queries tools, and invokes them.',
        objectives: ['Implement MCP Client with StdioClientTransport', 'Discover server tools dynamically and register in agent'],
        topics: ['MCP Client', 'Dynamic discovery', 'Process management'],
        tasks: [
          { title: 'Build client connecting to local MCP server process', priority: 'high' },
          { title: 'Automatically inject discovered MCP tools into agent loop', priority: 'high' }
        ]
      },
      {
        dayNumber: 48,
        title: 'Validation and permission boundaries',
        description: 'Implement access control: prevent path traversal attacks, sandbox file reading, and validate commands.',
        objectives: ['Restrict file access to designated workspace root', 'Reject disallowed shell patterns'],
        topics: ['Sandbox security', 'Path traversal defense', 'Access control'],
        tasks: [
          { title: 'Implement path sanitization and boundary check guard', priority: 'high' },
          { title: 'Write security tests verifying prevention of ../ directory escapes', priority: 'high' }
        ]
      },
      {
        dayNumber: 49,
        title: 'Demo, documentation and retrospective',
        description: 'Connect the MCP server to an external LLM interface or CLI, verify end-to-end operation, and write retrospective.',
        objectives: ['Test end-to-end agent query using MCP tools', 'Document MCP server API and usage', 'Weekly review'],
        topics: ['Integration testing', 'Documentation', 'Retrospective'],
        tasks: [
          { title: 'Perform live demo of agent inspecting repo via MCP', priority: 'high' },
          { title: 'Publish Week 7 retrospective journal entry', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 8,
    title: 'Coding Agent Foundations (Forge)',
    description: 'Kick off Forge: the autonomous AI coding agent. Build repo mapping, file search, targeted edits, git diff, and test runner.',
    deliverable: 'Core engine of Forge: can inspect a codebase, plan code edits, apply changes, and run tests.',
    objective: 'Implement autonomous coding primitives with safe diff generation and test feedback.',
    topics: ['Autonomous Coding', 'Codebase Mapping', 'AST / Regex Search', 'Diff Application', 'Test Execution'],
    reviewChecklist: [
      'Forge maps directory trees and extracts file symbol outlines',
      'Edits apply reliably using exact search-and-replace blocks',
      'Git diffs generated and presented to user clearly',
      'Test runner captures stdout/stderr and returns error context to agent'
    ],
    days: [
      {
        dayNumber: 50,
        title: 'Forge architecture and repository setup',
        description: 'Architect the Forge coding agent CLI; project layout, configuration, and execution state.',
        objectives: ['Define Forge core system architecture', 'Set up CLI entrypoint and config file parser'],
        topics: ['CLI architecture', 'System design', 'Forge core'],
        tasks: [
          { title: 'Create Forge project structure with src/tools, src/agent, src/cli', priority: 'high' },
          { title: 'Define workspace configuration schema (forge.config.json)', priority: 'medium' }
        ]
      },
      {
        dayNumber: 51,
        title: 'Repository exploration tools',
        description: 'Build fast file tree explorer, glob pattern matcher, and ripgrep/grep search tool.',
        objectives: ['Implement list_files tool ignoring .git, node_modules', 'Build regex search_files tool'],
        topics: ['File exploration', 'Glob matching', 'Code search'],
        tasks: [
          { title: 'Build fast workspace file tree crawler with ignore lists', priority: 'high' },
          { title: 'Build text/regex code search returning file paths and line matches', priority: 'high' }
        ]
      },
      {
        dayNumber: 52,
        title: 'File reading and codebase mapping',
        description: 'Implement chunked file reader with line numbers and skeleton generator (classes, methods, exports).',
        objectives: ['Implement read_file with startLine and endLine', 'Create symbol outline extractor for TypeScript files'],
        topics: ['Code reading', 'Symbol outlines', 'AST extraction'],
        tasks: [
          { title: 'Implement line-numbered read_file tool with pagination limits', priority: 'high' },
          { title: 'Build lightweight symbol outline generator for TypeScript files', priority: 'medium' }
        ]
      },
      {
        dayNumber: 53,
        title: 'Planning and task decomposition',
        description: 'Teach Forge to examine an issue, explore relevant files, and construct a concrete file modification plan.',
        objectives: ['Prompt model to produce structured coding plan', 'Separate exploration phase from editing phase'],
        topics: ['Code reasoning', 'Step-by-step editing plan', 'Context assembly'],
        tasks: [
          { title: 'Implement two-phase agent: 1) Explore & Plan, 2) Execute Edits', priority: 'high' },
          { title: 'Benchmark plan quality on 3 sample bug fixes', priority: 'medium' }
        ]
      },
      {
        dayNumber: 54,
        title: 'Controlled file editing',
        description: 'Implement targeted edit tool using exact search and replace blocks; handle whitespace and indentation.',
        objectives: ['Build edit_file tool with target string and replacement', 'Ensure atomic file updates with rollbacks'],
        topics: ['Atomic edits', 'Search-and-replace', 'Diff safety'],
        tasks: [
          { title: 'Implement search-and-replace edit_file engine with exact match check', priority: 'high' },
          { title: 'Write tests for multi-line indentation preservation during edits', priority: 'high' }
        ]
      },
      {
        dayNumber: 55,
        title: 'Git diff and test runner',
        description: 'Integrate git diff preview and automated test execution (npm test / jest / vitest).',
        objectives: ['Execute git diff after edits and display unified diff', 'Run test runner command and capture failure traces'],
        topics: ['Git diff', 'Process execution', 'Test runner'],
        tasks: [
          { title: 'Implement git diff generator highlighting modified hunks', priority: 'high' },
          { title: 'Build run_tests tool returning exit code, failed test names, and stack trace', priority: 'high' }
        ]
      },
      {
        dayNumber: 56,
        title: 'Approval flow and retrospective',
        description: 'Add interactive CLI approval before writing edits to disk; complete retrospective on week 8.',
        objectives: ['Show colorized diff to user and prompt [Y/n/edit]', 'Reflect on coding agent strengths and failure modes'],
        topics: ['CLI UX', 'Interactive approvals', 'Retrospective'],
        tasks: [
          { title: 'Implement interactive diff confirmation prompt before applying changes', priority: 'high' },
          { title: 'Complete Week 8 journal and commit Forge foundation', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 9,
    title: 'Multi-Agent Systems',
    description: 'Implement multi-agent patterns: supervisor-worker, specialized agent contracts, codebase researcher, and test specialist.',
    deliverable: 'A multi-agent team collaborating to solve complex programming tasks.',
    objective: 'Orchestrate multiple specialized agents communicating through contracts and shared state.',
    topics: ['Multi-Agent Systems', 'Supervisor Pattern', 'Specialist Contracts', 'Conflict Resolution', 'Agent Communication'],
    reviewChecklist: [
      'Supervisor agent successfully delegates sub-tasks to specialists',
      'Specialist agents adhere strictly to role boundaries',
      'Shared state resolves concurrent branch updates without data loss',
      'Demonstrated improvement in complex task success rate vs single agent'
    ],
    days: [
      {
        dayNumber: 57,
        title: 'Multi-agent patterns',
        description: 'Study multi-agent paradigms: peer-to-peer swarms vs hierarchical supervisor vs sequential handover.',
        objectives: ['Compare communication topologies', 'Identify scenarios where multi-agent outperforms single-agent'],
        topics: ['Multi-agent architecture', 'Communication topology', 'Role specialization'],
        tasks: [
          { title: 'Diagram hierarchical supervisor vs peer swarm architectures', priority: 'medium' },
          { title: 'Define message protocol between agents (sender, recipient, payload)', priority: 'high' }
        ]
      },
      {
        dayNumber: 58,
        title: 'Supervisor implementation',
        description: 'Build supervisor agent that receives user prompt, decomposes problem, and assigns work to workers.',
        objectives: ['Implement Supervisor agent loop', 'Route tasks based on worker agent capabilities'],
        topics: ['Supervisor agent', 'Routing', 'Work scheduling'],
        tasks: [
          { title: 'Build Supervisor prompt with available agent roster', priority: 'high' },
          { title: 'Implement task delegation and result aggregation logic', priority: 'high' }
        ]
      },
      {
        dayNumber: 59,
        title: 'Specialist agent contracts',
        description: 'Define input and output interfaces for specialist agents using strict Zod schemas.',
        objectives: ['Define AgentContract interface', 'Validate agent handoffs with typed schemas'],
        topics: ['Agent contracts', 'Interface design', 'Typed handoffs'],
        tasks: [
          { title: 'Define research agent contract: input question -> output file list & findings', priority: 'high' },
          { title: 'Define test specialist contract: input changes -> output test pass/fail report', priority: 'high' }
        ]
      },
      {
        dayNumber: 60,
        title: 'Codebase-analysis specialist',
        description: 'Create dedicated researcher agent specialized only in reading code, following call trees, and finding bug roots.',
        objectives: ['Constrain specialist tools to read-only search and AST', 'Optimize prompt for root-cause diagnosis'],
        topics: ['Read-only agent', 'Root cause analysis', 'Call graph tracing'],
        tasks: [
          { title: 'Assemble CodebaseAnalyzer specialist with read-only sandbox', priority: 'high' },
          { title: 'Test bug localization accuracy on 5 known repository issues', priority: 'high' }
        ]
      },
      {
        dayNumber: 61,
        title: 'Test/debug specialist',
        description: 'Build test specialist agent that writes reproduction tests, executes test suites, and verifies fixes.',
        objectives: ['Equip specialist with test-generation prompt and test runner', 'Enforce test-driven bug reproduction'],
        topics: ['TDD agent', 'Test generation', 'Regression prevention'],
        tasks: [
          { title: 'Implement TestSpecialist agent writing failing test before fix', priority: 'high' },
          { title: 'Verify test specialist confirms fix passes without side effects', priority: 'medium' }
        ]
      },
      {
        dayNumber: 62,
        title: 'Shared state and conflict handling',
        description: 'Manage shared workspace state when multiple agents propose edits; handle merge conflicts and race conditions.',
        objectives: ['Implement lock manager for file access', 'Detect conflicting diff proposals'],
        topics: ['Concurrency control', 'Conflict resolution', 'State synchronization'],
        tasks: [
          { title: 'Build file locking mechanism preventing simultaneous edits to same file', priority: 'high' },
          { title: 'Implement conflict detector and retry request to worker', priority: 'medium' }
        ]
      },
      {
        dayNumber: 63,
        title: 'Compare single-agent vs multi-agent and retrospective',
        description: 'Benchmark single-agent vs multi-agent on 5 real GitHub issues; analyze cost, latency, and success rate.',
        objectives: ['Measure task completion rate, token cost, and execution duration', 'Weekly retrospective'],
        topics: ['Benchmarking', 'Cost analysis', 'Retrospective'],
        tasks: [
          { title: 'Run comparative benchmark on 5 sample coding challenges', priority: 'high' },
          { title: 'Publish Week 9 retrospective journal entry with benchmark results', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 10,
    title: 'Evaluation and Benchmarking',
    description: 'Build comprehensive evaluation pipelines, custom benchmarks, scoring criteria, latency/cost tracking, and regression suites.',
    deliverable: 'Automated evaluation suite benchmarking coding agent success rate, tokens, and wall-clock time.',
    objective: 'Implement rigorous eval methodology to track model improvements and prevent regressions.',
    topics: ['LLM Evaluation', 'SWE-bench Methodology', 'Cost & Latency Tracking', 'Regression Suites', 'Assertion Evals'],
    reviewChecklist: [
      'Benchmark suite runs deterministically in reproducible environment',
      'Pass@1, latency, and token cost measured per run',
      'Automated regression check catches capability drops',
      'Detailed visual evaluation report generated'
    ],
    days: [
      {
        dayNumber: 64,
        title: 'Evaluation fundamentals',
        description: 'Learn evaluation concepts: unit tests vs LLM-as-a-judge vs task completion benchmarks like SWE-bench.',
        objectives: ['Understand pass@1 and pass@k metrics', 'Identify pitfalls of LLM-as-judge subjectivity'],
        topics: ['Evaluation theory', 'Pass@k', 'Ground truth'],
        tasks: [
          { title: 'Study SWE-bench evaluation methodology and write summary', priority: 'medium' },
          { title: 'Define evaluation metric schema (accuracy, cost, time, steps)', priority: 'high' }
        ]
      },
      {
        dayNumber: 65,
        title: 'Design benchmark tasks',
        description: 'Curate a dataset of 15 realistic coding problems with git repositories, problem statements, and test suites.',
        objectives: ['Create reproducible git test repositories', 'Define clear problem specifications'],
        topics: ['Benchmark curation', 'Test fixtures', 'Reproducibility'],
        tasks: [
          { title: 'Assemble 10 bug-fix scenarios and 5 feature-addition tasks', priority: 'high' },
          { title: 'Write automated harness to reset repositories to initial commit', priority: 'high' }
        ]
      },
      {
        dayNumber: 66,
        title: 'Define scoring and success criteria',
        description: 'Build automated verification: run test suite, verify exit code 0, check git diff sanity, and score solution.',
        objectives: ['Implement programmatic success validator', 'Award binary pass/fail based on test runner output'],
        topics: ['Programmatic validation', 'Exit codes', 'Scoring logic'],
        tasks: [
          { title: 'Implement automated task verifier running tests in clean subshell', priority: 'high' },
          { title: 'Add diff sanity check ensuring no unintended files were modified', priority: 'medium' }
        ]
      },
      {
        dayNumber: 67,
        title: 'Run first benchmark',
        description: 'Execute the full 15-task benchmark against Forge; record pass rate, total token expenditure, and execution times.',
        objectives: ['Run benchmark runner harness', 'Compute initial baseline pass@1 percentage'],
        topics: ['Baseline measurement', 'Benchmark execution', 'Pass@1'],
        tasks: [
          { title: 'Build automated batch runner executing all benchmark tasks', priority: 'high' },
          { title: 'Log baseline results into JSON benchmark database', priority: 'high' }
        ]
      },
      {
        dayNumber: 68,
        title: 'Track latency and cost',
        description: 'Profile time spent in planning vs tool execution vs model generation; breakdown cost per sub-task.',
        objectives: ['Profile latency bottlenecks in agent loop', 'Calculate dollar cost per benchmark task'],
        topics: ['Profiling', 'Cost accounting', 'Bottleneck analysis'],
        tasks: [
          { title: 'Build latency profiler recording step durations', priority: 'medium' },
          { title: 'Generate cost breakdown chart comparing prompt vs completion tokens', priority: 'medium' }
        ]
      },
      {
        dayNumber: 69,
        title: 'Add regression suite',
        description: 'Integrate the benchmark into CI: alert if changes to prompts or tools reduce pass rate or increase cost by >15%.',
        objectives: ['Build regression detection gate', 'Create quick 3-task smoke eval for PRs'],
        topics: ['CI/CD regression', 'Smoke eval', 'Performance budgets'],
        tasks: [
          { title: 'Implement regression threshold check comparing against baseline.json', priority: 'high' },
          { title: 'Create fast 2-minute smoke eval script for everyday development', priority: 'medium' }
        ]
      },
      {
        dayNumber: 70,
        title: 'Evaluation report and retrospective',
        description: 'Generate comprehensive markdown evaluation report with pass rates, charts, and analysis of failures.',
        objectives: ['Analyze root causes of failed benchmark tasks', 'Document week 10 insights and retrospective'],
        topics: ['Failure analysis', 'Evaluation reporting', 'Retrospective'],
        tasks: [
          { title: 'Generate visual markdown evaluation report with metrics table', priority: 'high' },
          { title: 'Complete Week 10 journal entry with failure mode categorization', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 11,
    title: 'Security and Sandboxing',
    description: 'Implement threat modeling, prompt injection defense, untrusted input sanitation, Docker container sandboxing, and secret hygiene.',
    deliverable: 'Sandboxed execution environment with strict system permissions and security defenses.',
    objective: 'Harden autonomous agent against prompt injections, unauthorized file access, and arbitrary code execution.',
    topics: ['Threat Modeling', 'Prompt Injection', 'Sandboxing', 'Command Whitelisting', 'Secret Hygiene'],
    reviewChecklist: [
      'Agent rejects indirect prompt injections in untrusted files or search results',
      'Shell commands execute in isolated container or restricted subshell',
      'Sensitive files (.env, keys) cannot be read by agent',
      'All security test scenarios pass'
    ],
    days: [
      {
        dayNumber: 71,
        title: 'Threat model and prompt injection',
        description: 'Analyze security risks: direct injection, indirect injection via ingested files, data exfiltration, and resource exhaustion.',
        objectives: ['Create comprehensive threat model for coding agents', 'Demonstrate indirect prompt injection attack in test file'],
        topics: ['Threat modeling', 'Indirect prompt injection', 'Security taxonomy'],
        tasks: [
          { title: 'Write Threat Model document for Forge covering all attack vectors', priority: 'high' },
          { title: 'Create test file containing malicious injection instructions', priority: 'medium' }
        ]
      },
      {
        dayNumber: 72,
        title: 'Untrusted input handling',
        description: 'Isolate untrusted data using data delimiters (e.g. <untrusted_content>), structural separation, and meta-prompts.',
        objectives: ['Implement XML tag boundary encapsulation for external content', 'Instruct model to treat delimited content purely as passive data'],
        topics: ['Input sanitization', 'Delimiters', 'Context separation'],
        tasks: [
          { title: 'Build input wrapper wrapping file contents in strict XML tags', priority: 'high' },
          { title: 'Test injection resistance against 10 prompt injection payloads', priority: 'high' }
        ]
      },
      {
        dayNumber: 73,
        title: 'Filesystem and command restrictions',
        description: 'Block access to sensitive paths (.env, ~/.ssh, /etc/passwd); enforce command whitelisting for shell execution.',
        objectives: ['Implement path denylist and canonical path resolver', 'Create strict command whitelist (git, npm test, tsc)'],
        topics: ['Filesystem security', 'Path traversal', 'Command whitelisting'],
        tasks: [
          { title: 'Implement path guard blocking access outside workspace root', priority: 'high' },
          { title: 'Implement command parser allowing only approved binaries and flags', priority: 'high' }
        ]
      },
      {
        dayNumber: 74,
        title: 'Sandbox and approval gates',
        description: 'Run commands inside ephemeral Docker container or unprivileged sandbox; require explicit user approval for network calls.',
        objectives: ['Configure Docker container sandbox for command execution', 'Mount workspace as non-root user with read/write boundaries'],
        topics: ['Docker sandboxing', 'Container isolation', 'Approval gates'],
        tasks: [
          { title: 'Create lightweight Dockerfile sandbox for executing user code', priority: 'high' },
          { title: 'Implement bridge executing agent shell commands inside container', priority: 'high' }
        ]
      },
      {
        dayNumber: 75,
        title: 'Secrets and logging hygiene',
        description: 'Sanitize logs and tool outputs: detect API keys, tokens, and passwords using entropy analysis and regex, and mask them.',
        objectives: ['Build secret scrubber filter', 'Ensure secrets never appear in model prompts, traces, or terminal output'],
        topics: ['Secret masking', 'Entropy scanning', 'Telemetry privacy'],
        tasks: [
          { title: 'Implement regex secret detector for API keys, bearer tokens, and private keys', priority: 'high' },
          { title: 'Add scrubbing middleware to execution tracer and logger', priority: 'medium' }
        ]
      },
      {
        dayNumber: 76,
        title: 'Security test scenarios',
        description: 'Run automated red-team test suite: attempt directory escape, command injection, secret leakage, and malicious prompt execution.',
        objectives: ['Execute automated adversarial test suite', 'Verify zero successful privilege escalations'],
        topics: ['Red-teaming', 'Adversarial testing', 'Security validation'],
        tasks: [
          { title: 'Write 12 automated red-team security test cases', priority: 'high' },
          { title: 'Verify all 12 tests are safely intercepted by security guards', priority: 'high' }
        ]
      },
      {
        dayNumber: 77,
        title: 'Fix findings and retrospective',
        description: 'Patch all identified vulnerabilities, document security best practices for AI agents, and complete retrospective.',
        objectives: ['Harden all security boundaries based on test results', 'Publish security advisory guide', 'Weekly review'],
        topics: ['Vulnerability remediation', 'Documentation', 'Retrospective'],
        tasks: [
          { title: 'Patch edge cases identified during red-teaming', priority: 'high' },
          { title: 'Publish Week 11 retrospective journal entry', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 12,
    title: 'Deployment and Productionisation',
    description: 'Wrap Forge with a production API, websocket streaming progress, dockerization, rate limiting, and telemetry monitoring.',
    deliverable: 'Dockerized Forge service exposed via REST/WebSocket API with live streaming progress updates.',
    objective: 'Transform local CLI agent into scalable, deployable production service.',
    topics: ['API Design', 'WebSocket Streaming', 'Dockerization', 'Rate Limiting', 'Production Tracing'],
    reviewChecklist: [
      'REST API creates jobs and returns job IDs',
      'WebSocket streams token output and step events in real-time',
      'Docker container builds reliably with multi-stage optimization',
      'Rate limiting and cost quotas enforced per client'
    ],
    days: [
      {
        dayNumber: 78,
        title: 'API and deployment architecture',
        description: 'Design production architecture: Next.js/Fastify backend, job queue, worker pool, and client dashboards.',
        objectives: ['Design REST and WebSocket API specification', 'Define asynchronous job lifecycle (queued, running, finished, failed)'],
        topics: ['API architecture', 'Job queues', 'Async processing'],
        tasks: [
          { title: 'Write OpenAPI specification for Forge agent service', priority: 'high' },
          { title: 'Design database schema for agent jobs and event logs', priority: 'medium' }
        ]
      },
      {
        dayNumber: 79,
        title: 'Expose Forge through an API',
        description: 'Build backend endpoints to submit task, query status, fetch execution diff, and approve/cancel actions.',
        objectives: ['Implement POST /api/jobs and GET /api/jobs/:id', 'Manage worker process lifecycle'],
        topics: ['REST API', 'Controller logic', 'Job management'],
        tasks: [
          { title: 'Build job submission and status REST endpoints', priority: 'high' },
          { title: 'Implement background job worker executing Forge engine', priority: 'high' }
        ]
      },
      {
        dayNumber: 80,
        title: 'Job status and progress',
        description: 'Stream live execution steps, terminal outputs, and file diffs over WebSocket / Server-Sent Events (SSE).',
        objectives: ['Implement WebSocket / SSE streaming server', 'Broadcast step start, tool call, and tool result events'],
        topics: ['WebSocket', 'Server-Sent Events', 'Real-time telemetry'],
        tasks: [
          { title: 'Build SSE endpoint streaming live agent event stream', priority: 'high' },
          { title: 'Build frontend consumer displaying live terminal log', priority: 'medium' }
        ]
      },
      {
        dayNumber: 81,
        title: 'Logging and tracing',
        description: 'Integrate OpenTelemetry / structured JSON logging; export traces to monitoring dashboards.',
        objectives: ['Instrument agent operations with OpenTelemetry spans', 'Track token usage and latency across distributed spans'],
        topics: ['OpenTelemetry', 'Structured logging', 'Observability'],
        tasks: [
          { title: 'Add OpenTelemetry tracing to agent core execution loop', priority: 'high' },
          { title: 'Configure structured JSON log output with correlation IDs', priority: 'medium' }
        ]
      },
      {
        dayNumber: 82,
        title: 'Rate limits and cost budgets',
        description: 'Implement token bucket rate limiter and budget caps: stop agent if job exceeds $2.00 or 100,000 tokens.',
        objectives: ['Enforce per-user token and dollar budgets', 'Implement sliding window rate limiting'],
        topics: ['Rate limiting', 'Cost budgeting', 'Quota enforcement'],
        tasks: [
          { title: 'Implement budget manager terminating job when dollar limit is reached', priority: 'high' },
          { title: 'Write unit tests verifying quota enforcement', priority: 'medium' }
        ]
      },
      {
        dayNumber: 83,
        title: 'Dockerise and deploy',
        description: 'Build optimized multi-stage Docker container for Forge; deploy to cloud container service or local server.',
        objectives: ['Write multi-stage Dockerfile minimizing image size', 'Configure docker-compose with Redis and Postgres'],
        topics: ['Docker', 'Multi-stage builds', 'Container deployment'],
        tasks: [
          { title: 'Create production multi-stage Dockerfile for Forge service', priority: 'high' },
          { title: 'Test container startup and execute sample job inside container', priority: 'high' }
        ]
      },
      {
        dayNumber: 84,
        title: 'Smoke tests and retrospective',
        description: 'Perform end-to-end smoke testing of deployed API, verify webhooks, and complete retrospective.',
        objectives: ['Execute automated smoke test script against deployed API', 'Weekly review'],
        topics: ['Smoke testing', 'End-to-end testing', 'Retrospective'],
        tasks: [
          { title: 'Run automated end-to-end curl/HTTP test suite against container', priority: 'high' },
          { title: 'Publish Week 12 retrospective journal entry', priority: 'high' }
        ]
      }
    ]
  },
  {
    weekNumber: 13,
    title: 'Capstone: Autonomous Coding Agent Complete',
    description: 'Finalize Forge capstone: end-to-end autonomous workflow, polishing diffs, running final benchmarks, writing case study, and roadmap.',
    deliverable: 'Complete, production-ready Forge Autonomous Coding Agent with benchmarks, docs, and case study.',
    objective: 'Ship polished autonomous AI coding agent with high benchmark reliability and published case study.',
    topics: ['Capstone Project', 'End-to-End Reliability', 'Final Benchmarking', 'Case Study', 'Future Roadmap'],
    reviewChecklist: [
      'Forge autonomously investigates, plans, edits, and tests bug fixes from start to finish',
      'Final benchmark confirms substantial improvement over baseline',
      'Comprehensive documentation, architecture diagram, and quickstart guide',
      'Case study published summarizing the 90-day journey'
    ],
    days: [
      {
        dayNumber: 85,
        title: 'Complete end-to-end workflow',
        description: 'Integrate all subsystems: exploration, planning, multi-agent specialists, diff generation, sandboxed test verification, and logging.',
        objectives: ['Execute full task lifecycle autonomously from single user prompt', 'Verify seamless handoffs between all components'],
        topics: ['System integration', 'Autonomous workflows', 'End-to-end verification'],
        tasks: [
          { title: 'Wire full end-to-end workflow from CLI input to verified pull request diff', priority: 'high' },
          { title: 'Test on complex multi-file refactoring challenge', priority: 'high' }
        ]
      },
      {
        dayNumber: 86,
        title: 'Improve diffs, approvals and run history',
        description: 'Refine interactive diff visualization, add syntax highlighting, rollback history, and interactive comments.',
        objectives: ['Polish developer experience in terminal and web UI', 'Support partial hunk approvals and rollback'],
        topics: ['Developer experience', 'Diff rendering', 'Version rollback'],
        tasks: [
          { title: 'Enhance terminal diff output with syntax colors and hunk statistics', priority: 'high' },
          { title: 'Implement one-click rollback of failed agent runs', priority: 'medium' }
        ]
      },
      {
        dayNumber: 87,
        title: 'Run final benchmark',
        description: 'Run the complete 15-task benchmark suite against Forge; compare results against day 67 baseline.',
        objectives: ['Measure final pass@1 score, cost efficiency, and speedup', 'Record benchmark improvements'],
        topics: ['Final benchmark', 'Performance comparison', 'Evaluation'],
        tasks: [
          { title: 'Execute full benchmark run and record final metrics', priority: 'high' },
          { title: 'Create comparison table highlighting day 67 vs day 87 gains', priority: 'high' }
        ]
      },
      {
        dayNumber: 88,
        title: 'Fix reliability and security issues',
        description: 'Address edge cases, flaky test interactions, and transient API failures identified in the final benchmark.',
        objectives: ['Eliminate remaining failure modes', 'Ensure 100% clean test passes'],
        topics: ['Reliability engineering', 'Bug fixes', 'Hardening'],
        tasks: [
          { title: 'Fix top 3 failure modes discovered during final benchmark', priority: 'high' },
          { title: 'Verify regression suite remains green across all benchmark tasks', priority: 'high' }
        ]
      },
      {
        dayNumber: 89,
        title: 'README, architecture diagram and demo',
        description: 'Create high-quality documentation: system architecture diagrams, installation guide, demo GIF, and quickstart tutorial.',
        objectives: ['Publish comprehensive project documentation', 'Record terminal / video demo of Forge in action'],
        topics: ['Documentation', 'Architecture diagrams', 'Developer outreach'],
        tasks: [
          { title: 'Create detailed Mermaid architecture diagram in README', priority: 'high' },
          { title: 'Write Quickstart guide enabling setup in under 5 minutes', priority: 'high' }
        ]
      },
      {
        dayNumber: 90,
        title: 'Publish case study and plan the next 90 days',
        description: 'Celebrate completing 90 days! Publish in-depth case study on building Forge, key insights, and roadmap for the next 90 days.',
        objectives: ['Write technical retrospective blog post / case study', 'Define next phase of AI engineering learning'],
        topics: ['Case study', 'Retrospective', 'Lifelong learning'],
        tasks: [
          { title: 'Write comprehensive 90-day retrospective and publish case study', priority: 'high' },
          { title: 'Define next 90-day roadmap (e.g. Distributed LLM Systems, Local Model Fine-tuning)', priority: 'high' },
          { title: 'Mark Day 90 and complete the AI Engineering 90-Day Journey!', priority: 'high' }
        ]
      }
    ]
  }
];

// Build complete data object
const seedData = {
  schemaVersion: "1.0",
  id: "ai-engineering-90-days",
  title: "AI Engineering — 90 Days",
  description: "A practical 90-day journey to learn LLM fundamentals, build AI agents, understand MCP, RAG, orchestration, evaluation and deploy an autonomous coding agent.",
  category: "Technology",
  status: "active",
  startDate: new Date().toISOString().split('T')[0],
  targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyCommitmentMinutes: 180,
  icon: "Cpu",
  accentColor: "#e11d48",
  repositoryUrl: "",
  weeks: rawWeeks.map((w) => ({
    id: `week-${String(w.weekNumber).padStart(2, '0')}`,
    weekNumber: w.weekNumber,
    title: w.title,
    description: w.description,
    deliverable: w.deliverable,
    objective: w.objective,
    topics: w.topics,
    reviewChecklist: w.reviewChecklist,
    days: w.days.map((d) => ({
      id: `day-${String(d.dayNumber).padStart(2, '0')}`,
      dayNumber: d.dayNumber,
      title: d.title,
      description: d.description,
      objectives: d.objectives,
      topics: d.topics,
      repositoryUrl: "",
      estimatedMinutes: 180,
      status: "pending",
      tasks: d.tasks.map((t, idx) => ({
        id: `task-d${d.dayNumber}-${idx + 1}`,
        title: t.title,
        priority: t.priority,
        status: "todo",
        repositoryUrl: "",
        completedAt: null
      })),
      notes: "",
      completedAt: null,
      timeSpentMinutes: 0
    }))
  })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

fs.mkdirSync('data', { recursive: true });
fs.mkdirSync('public/data', { recursive: true });

fs.writeFileSync('data/ai-engineering-90-days.json', JSON.stringify(seedData, null, 2));
fs.writeFileSync('public/data/ai-engineering-90-days.json', JSON.stringify(seedData, null, 2));

console.log('Successfully generated 90-day seed data in data/ and public/data/ !');
console.log(`Total weeks: ${seedData.weeks.length}, total days: ${seedData.weeks.reduce((acc, w) => acc + w.days.length, 0)}`);
