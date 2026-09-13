import { ProblemProps } from '../domain/Problem';

export const SEED_PROBLEMS: ProblemProps[] = [
  {
    id: 'prob-1',
    title: 'Parking Lot System',
    slug: 'parking-lot-system',
    difficulty: 'BEGINNER',
    summary: 'Design an automated multi-floor parking lot supporting different vehicle sizes, spot assignment strategies, and ticket fee calculation.',
    description: `A commercial parking lot operates across multiple floors. It caters to various vehicle types (Motorcycles, Cars, Trucks/Buses) with specifically designated parking spots (Compact, Regular, Large, Electric). 

When a vehicle arrives at an entry gate, the system checks spot availability, allocates an optimal spot according to an allocation strategy, issues a ticket with timestamp and spot coordinates, and opens the barrier. 

Upon departure at an exit gate, the ticket is scanned, parking duration is calculated, a pricing strategy is applied to compute the fee, payment is processed, and the spot is marked vacant.`,
    context: `Key Goals:
1. Clean separation between Vehicle, Spot, Floor, and ParkingLot.
2. Extensibility for dynamic pricing (e.g., hourly, flat-rate, peak-hour).
3. Strategy pattern for spot allocation (e.g. Nearest to entrance, Lowest floor first).
4. Concurrency safety considerations for simultaneous gate access.`,
    requirements: [
      {
        id: 'req-1',
        code: 'REQ-1',
        description: 'Support multiple vehicle types (Motorcycle, Car, Truck) and matched spot types (Compact, Regular, Large).',
        keywords: ['vehicle', 'car', 'bike', 'motorcycle', 'truck', 'spot', 'compact', 'large', 'regular'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-2',
        code: 'REQ-2',
        description: 'Manage multiple floors, each having designated counts of different spot types.',
        keywords: ['floor', 'parkingfloor', 'level', 'spots', 'capacity'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-3',
        code: 'REQ-3',
        description: 'Spot allocation strategy to assign spots upon vehicle entry (e.g., Nearest to entry).',
        keywords: ['allocate', 'assign', 'strategy', 'findspot', 'park', 'entry', 'gate'],
        criticality: 'IMPORTANT',
      },
      {
        id: 'req-4',
        code: 'REQ-4',
        description: 'Generate a Parking Ticket upon entry with unique ID, timestamp, vehicle license, and spot info.',
        keywords: ['ticket', 'issue', 'entryticket', 'timestamp', 'barcode'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-5',
        code: 'REQ-5',
        description: 'Calculate parking fee upon exit based on duration and vehicle type pricing rules.',
        keywords: ['fee', 'pricing', 'calculate', 'payment', 'rate', 'cost', 'exit'],
        criticality: 'IMPORTANT',
      },
    ],
    rubric: {
      dimensions: [
        { id: 'dim-1', name: 'Requirement Coverage', weight: 0.25, description: 'All operational flows (entry, parking, ticketing, payment, exit) addressed.' },
        { id: 'dim-2', name: 'Single Responsibility & Cohesion', weight: 0.25, description: 'ParkingLot does not bundle pricing or spot finding algorithms directly.' },
        { id: 'dim-3', name: 'Abstraction & Polymorphism', weight: 0.20, description: 'Vehicles, spots, and pricing policies modeled with polymorphic abstractions.' },
        { id: 'dim-4', name: 'Coupling & Extensibility', weight: 0.20, description: 'Ease of adding ElectricVehicle or new SpotAllocationStrategy.' },
        { id: 'dim-5', name: 'Design Rationale & Trade-offs', weight: 0.10, description: 'Sound justification of design patterns (Strategy, Factory, Singleton).' },
      ],
    },
    starterHint: 'Consider separating spot finding and pricing logic into strategy interfaces rather than embedding them in ParkingLot or ParkingFloor.',
    tags: ['Strategy Pattern', 'Factory Pattern', 'Composition', 'OOP Fundamentals'],
  },
  {
    id: 'prob-2',
    title: 'Elevator Control System',
    slug: 'elevator-control-system',
    difficulty: 'INTERMEDIATE',
    summary: 'Design a multi-car elevator dispatching and control system handling passenger requests, directional movement, and scheduling algorithms.',
    description: `A modern skyscraper features N elevator cars servicing M floors. Passengers can make external requests from any floor (indicating UP or DOWN direction) and internal requests from inside an elevator car (selecting destination floor).

An Elevator Controller manages the fleet, listening to floor hall calls and assigning the most suitable elevator car using a scheduling algorithm (e.g., SCAN/LOOK algorithm, Nearest-Car-First). 

Each elevator car maintains its own movement state (IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE), door operations, and queue of stops.`,
    context: `Key Goals:
1. State Pattern for elevator car movement states.
2. Strategy Pattern for elevator dispatching and request scheduling.
3. Decoupling the physical Car from the fleet Controller.
4. Handling edge cases: emergency stops, weight limits, and reverse directions.`,
    requirements: [
      {
        id: 'req-e1',
        code: 'REQ-1',
        description: 'Support multi-car fleet with individual elevator state (IDLE, MOVING_UP, MOVING_DOWN).',
        keywords: ['car', 'elevator', 'state', 'idle', 'moving', 'direction', 'door'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-e2',
        code: 'REQ-2',
        description: 'Differentiate between internal requests (destination buttons) and external requests (hall up/down buttons).',
        keywords: ['request', 'button', 'internal', 'external', 'hall', 'destination', 'floor'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-e3',
        code: 'REQ-3',
        description: 'Central Elevator Controller / Dispatcher coordinating car assignments using a scheduling strategy.',
        keywords: ['controller', 'dispatcher', 'scheduler', 'strategy', 'dispatch', 'assign'],
        criticality: 'IMPORTANT',
      },
      {
        id: 'req-e4',
        code: 'REQ-4',
        description: 'Process floor stops sequentially based on directional priority (e.g., SCAN / LOOK algorithm).',
        keywords: ['scan', 'look', 'priority', 'stops', 'queue', 'nextfloor', 'step'],
        criticality: 'IMPORTANT',
      },
    ],
    rubric: {
      dimensions: [
        { id: 'dim-e1', name: 'Requirement Coverage', weight: 0.25, description: 'Captures fleet control, internal/external requests, and car movement.' },
        { id: 'dim-e2', name: 'State Management', weight: 0.25, description: 'Robust modeling of car movement and door open/close states.' },
        { id: 'dim-e3', name: 'Scheduling Extensibility', weight: 0.25, description: 'Pluggable dispatching strategies (e.g. FCFS, SSTF, SCAN).' },
        { id: 'dim-e4', name: 'Coupling & Cohesion', weight: 0.25, description: 'ElevatorCar focuses on mechanical motion; Controller handles fleet optimization.' },
      ],
    },
    starterHint: 'Avoid putting scheduling logic inside the ElevatorCar. Let a Dispatcher use a DispatchStrategy to route calls to the best car.',
    tags: ['State Pattern', 'Strategy Pattern', 'Observer Pattern', 'Scheduler'],
  },
  {
    id: 'prob-3',
    title: 'Vending Machine',
    slug: 'vending-machine',
    difficulty: 'BEGINNER',
    summary: 'Design an automated vending machine system managing user cash balance, product inventory, state transitions, and dispensing.',
    description: `A vending machine stocks snacks and drinks across racks/shelves with specific codes (e.g., A1, B2). It accepts currency (coins and notes), tracks current inserted balance, dispenses selected items, and returns exact change.

The machine transitions through distinct operational states:
1. NoMoneyState (Idle)
2. HasMoneyState (Money inserted, waiting for code selection)
3. DispensingState (Item released)
4. SoldOutState / MaintenanceState`,
    context: `Key Goals:
1. Classic State Pattern implementation for valid state transitions.
2. Inventory management per rack/slot with product price and quantity.
3. Change calculation and refund handling.`,
    requirements: [
      {
        id: 'req-v1',
        code: 'REQ-1',
        description: 'Manage inventory of products with item code, name, price, and remaining quantity per rack/slot.',
        keywords: ['inventory', 'product', 'item', 'rack', 'slot', 'quantity', 'price'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-v2',
        code: 'REQ-2',
        description: 'Accept currency (coins, notes), maintain active balance, and provide cancel/refund capability.',
        keywords: ['money', 'coin', 'note', 'currency', 'balance', 'refund', 'cash'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-v3',
        code: 'REQ-3',
        description: 'Transition safely through states (Idle, MoneyInserted, Dispensing, SoldOut) enforcing valid actions per state.',
        keywords: ['state', 'transition', 'idle', 'dispense', 'hasmoney', 'soldout'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-v4',
        code: 'REQ-4',
        description: 'Dispense selected item and calculate exact change return.',
        keywords: ['dispense', 'change', 'returnchange', 'collect'],
        criticality: 'IMPORTANT',
      },
    ],
    rubric: {
      dimensions: [
        { id: 'dim-v1', name: 'Requirement Coverage', weight: 0.25, description: 'Inventory, payments, state machine, and change return.' },
        { id: 'dim-v2', name: 'State Pattern Fidelity', weight: 0.35, description: 'Clean state interface avoiding messy nested switch/if statements.' },
        { id: 'dim-v3', name: 'Cohesion & Encapsulation', weight: 0.25, description: 'Inventory protects product stock; CoinHandler handles denomination logic.' },
        { id: 'dim-v4', name: 'Trade-offs & Rationale', weight: 0.15, description: 'Documented rationale for chosen state design and error guards.' },
      ],
    },
    starterHint: 'The State pattern is the cleanest way to prevent invalid actions like dispensing before payment is received.',
    tags: ['State Pattern', 'Finite State Machine', 'Encapsulation'],
  },
  {
    id: 'prob-4',
    title: 'Tic-Tac-Toe & Grid Games',
    slug: 'tic-tac-toe',
    difficulty: 'INTERMEDIATE',
    summary: 'Design an extensible N x N Tic-Tac-Toe game supporting custom board sizes, multiple players, piece symbols, and pluggable win-checking strategies.',
    description: `Design an object-oriented Tic-Tac-Toe game that can scale beyond 3x3 to any N x N board, support 2 or more players, and allow pluggable win-checking rules (Standard Row/Column/Diagonal, Connect-4 style, or Time-limited moves).

Players take turns placing their unique piece/symbol on the board. The system validates move legality, updates the board, checks for a win or draw condition, and switches active players.`,
    context: `Key Goals:
1. Decoupling the Board, Cell, Piece, Player, and Game controller.
2. Pluggable WinCheckStrategy to support alternate win rules without altering Game.
3. Move history and Undo capability (Command Pattern).`,
    requirements: [
      {
        id: 'req-t1',
        code: 'REQ-1',
        description: 'Represent an N x N grid board composed of cells holding piece symbols.',
        keywords: ['board', 'grid', 'cell', 'size', 'dimension'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-t2',
        code: 'REQ-2',
        description: 'Model Player with unique identifier and Piece / Symbol (e.g. X, O).',
        keywords: ['player', 'piece', 'symbol', 'turn'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-t3',
        code: 'REQ-3',
        description: 'Validate move boundaries, cell occupancy, and execute turn progression.',
        keywords: ['move', 'makemove', 'valid', 'play', 'turn', 'queue'],
        criticality: 'CRITICAL',
      },
      {
        id: 'req-t4',
        code: 'REQ-4',
        description: 'Strategy for verifying winning condition (row, column, diagonal, or custom N-in-a-row).',
        keywords: ['win', 'checkwin', 'strategy', 'winner', 'draw', 'diagonal'],
        criticality: 'IMPORTANT',
      },
    ],
    rubric: {
      dimensions: [
        { id: 'dim-t1', name: 'Requirement Coverage', weight: 0.25, description: 'Board, player turns, move validation, and victory detection.' },
        { id: 'dim-t2', name: 'Open/Closed Principle', weight: 0.30, description: 'Extensibility for board size N and alternate winning algorithms.' },
        { id: 'dim-t3', name: 'Domain Decomposition', weight: 0.25, description: 'Clear separation between Board, Game engine, and Rules.' },
        { id: 'dim-t4', name: 'Design Patterns', weight: 0.20, description: 'Strategy pattern for win checks and optional Command pattern for move history.' },
      ],
    },
    starterHint: 'Make the win evaluation a strategy interface so you can test 3-in-a-row or 4-in-a-row without changing Game code.',
    tags: ['Strategy Pattern', 'Command Pattern', 'Game Loop', 'Extensibility'],
  },
];
