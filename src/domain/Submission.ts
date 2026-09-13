import { 
  SubmissionData, 
  ClassModel, 
  InterfaceModel, 
  RelationshipModel 
} from './types';

export class Submission {
  readonly classes: ClassModel[];
  readonly interfaces: InterfaceModel[];
  readonly relationships: RelationshipModel[];
  readonly designPatterns: string[];
  readonly explanation: string;
  readonly codeSnippet?: string;
  readonly submittedAt: Date;

  constructor(data: Partial<SubmissionData> & { submittedAt?: Date }) {
    this.classes = data.classes || [];
    this.interfaces = data.interfaces || [];
    this.relationships = data.relationships || [];
    this.designPatterns = data.designPatterns || [];
    this.explanation = data.explanation || '';
    this.codeSnippet = data.codeSnippet;
    this.submittedAt = data.submittedAt || new Date();
  }

  getAllTypeNames(): Set<string> {
    const names = new Set<string>();
    this.classes.forEach((c) => names.add(c.name.trim().toLowerCase()));
    this.interfaces.forEach((i) => names.add(i.name.trim().toLowerCase()));
    return names;
  }

  getAllMethods(): string[] {
    const methods: string[] = [];
    this.classes.forEach((c) => c.methods.forEach((m) => methods.push(m.name)));
    this.interfaces.forEach((i) => i.methods.forEach((m) => methods.push(m.name)));
    return methods;
  }

  hasValidStructure(): boolean {
    return this.classes.length > 0 || this.interfaces.length > 0;
  }

  findClass(name: string): ClassModel | undefined {
    return this.classes.find((c) => c.name.toLowerCase() === name.toLowerCase());
  }

  findInterface(name: string): InterfaceModel | undefined {
    return this.interfaces.find((i) => i.name.toLowerCase() === name.toLowerCase());
  }

  toJSON(): SubmissionData {
    return {
      classes: this.classes,
      interfaces: this.interfaces,
      relationships: this.relationships,
      designPatterns: this.designPatterns,
      explanation: this.explanation,
      codeSnippet: this.codeSnippet,
    };
  }
}
