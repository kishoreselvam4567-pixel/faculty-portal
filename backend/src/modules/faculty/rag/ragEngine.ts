import { chunkText } from './chunker';
import { vectorStore } from './ragVectorStore';
import { KnowledgeDocument, DocumentChunk, RAGSearchResult } from './rag.types';
import { aiEngine } from '../ai/aiEngine';

class RAGKnowledgeEngine {
  private documents: Map<string, KnowledgeDocument> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed official institutional knowledge documents
    const seedDocs: Array<Omit<KnowledgeDocument, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'doc-syl-cs701',
        title: 'CS701 Cloud Computing & Virtualization Course Syllabus',
        documentName: 'CS701_Curriculum_2026.pdf',
        category: 'SYLLABUS',
        departmentId: '1aa45ae9-e872-4931-8e67-22f5119ce498',
        content: `Course Code: CS701 | Course Name: Cloud Computing & Virtualization | Credits: 4 (3 Lectures, 2 Lab Practical hours per week).
Semester: Term 7. Prerequisite: Operating Systems and Computer Networks.
Unit 1: Cloud Principles and Deployment Models: NIST definition, Public, Private, Hybrid, Community clouds. IaaS, PaaS, SaaS service architectures.
Unit 2: Virtualization Technologies: Type-1 and Type-2 Hypervisors. Hardware virtualization, CPU and Memory overcommit, Kernel-based Virtual Machine (KVM), Xen, Docker containerization.
Unit 3: Cloud Resource Scheduling and Storage: Distributed file systems, Google GFS, HDFS, Amazon S3 object stores. SLA management, autoscaling policies.
Unit 4: Microservices and Container Orchestration: Kubernetes cluster architecture, Pods, Services, Ingress controllers, Helm charts.
Unit 5: Cloud Security and Compliance: Identity & Access Management (IAM), multi-tenancy isolation, cloud auditing, FedRAMP and SOC2 standards.
Prescribed Textbooks: Distributed and Cloud Computing by Kai Hwang, Cloud Computing Concepts, Technology & Architecture by Thomas Erl.`,
      },
      {
        id: 'doc-syl-cs702',
        title: 'CS702 Cryptography & Network Security Course Specification',
        documentName: 'CS702_Syllabus_2026.pdf',
        category: 'SYLLABUS',
        departmentId: '1aa45ae9-e872-4931-8e67-22f5119ce498',
        content: `Course Code: CS702 | Course Name: Cryptography & Network Security | Credits: 4.
Semester: Term 7. Prerequisite: Discrete Mathematics.
Unit 1: Classical Encryption Techniques: Symmetric ciphers, Substitution, Transposition, DES, AES algorithm and Galois Counter Mode (GCM).
Unit 2: Public Key Cryptography: Prime numbers, Euler totient, RSA, Diffie-Hellman Key Exchange, Elliptic Curve Cryptography (ECC).
Unit 3: Cryptographic Hash Functions & Signatures: SHA-256, SHA-3, HMAC, Digital Signature Standard (DSS).
Unit 4: Transport Layer & Network Security: SSL/TLS 1.3 protocol handshake, IPsec architecture, VPNs.
Unit 5: System Security: Firewalls, Intrusion Detection Systems (IDS), zero-trust network architectures.`,
      },
      {
        id: 'doc-reg-attendance',
        title: 'Academic Regulations 2026 — Student Attendance & Condonation Rules',
        documentName: 'College_Academic_Regulations_2026.pdf',
        category: 'REGULATIONS',
        departmentId: null, // College-wide policy
        content: `Regulation Clause 4: Attendance Requirements and Eligibility for Examinations.
Clause 4.1: Regular Attendance: Every student is required to secure a minimum of 75% attendance in aggregate across all registered courses in a semester to be eligible to appear for the End Semester Examinations.
Clause 4.2: Condonation of Shortage: Students securing between 65% and 74.9% attendance may apply for condonation on valid medical grounds or on authorized representation of the College in sports/cultural/NCC events, supported by authentic hospital certificates submitted within 7 days of absence.
Clause 4.3: Disqualification (Redo/Detention): Students who secure attendance below 65% are strictly not eligible to appear for the end-semester examinations under any circumstances. Such candidates must repeat the semester in the subsequent academic year.
Clause 4.4: Faculty Incharge Responsibility: Class Incharges must verify attendance percentages at the end of each month and alert the Head of the Department and parents of students falling below the 75% threshold.`,
      },
      {
        id: 'doc-exam-cia',
        title: 'Continuous Internal Assessment (CIA) & Examination Evaluation Policy 2026',
        documentName: 'Examination_Evaluation_Policy_2026.pdf',
        category: 'EXAMINATION',
        departmentId: null,
        content: `Clause 7: Assessment Weightage for Theory Courses.
Total Marks: 100. Continuous Internal Assessment (CIA): 40 Marks. End Semester University Examination (ESE): 60 Marks.
Breakdown of CIA (40 Marks):
1. Midterm Assessment Test 1 (MAT-1): 15 Marks (conducted at week 6).
2. Midterm Assessment Test 2 (MAT-2): 15 Marks (conducted at week 12).
3. Assignments / Case Studies / Mini-Projects: 5 Marks.
4. Class Quizzes and Attendance regularities: 5 Marks.
For Laboratory Courses: Continuous Lab Evaluation: 60 Marks. End Semester Practical Examination: 40 Marks.
Minimum Passing Criteria: A student must obtain at least 45% in End Semester Examination (27 out of 60) and 50% overall in aggregate (50 out of 100) to clear the course.`,
      },
      {
        id: 'doc-guide-incharge',
        title: 'Faculty Class Incharge Guidelines & Mentorship Standard Operating Procedure',
        documentName: 'Faculty_Class_Incharge_SOP.pdf',
        category: 'FACULTY_GUIDELINE',
        departmentId: null,
        content: `Roles and Responsibilities of Class Incharge:
1. Daily Attendance Oversight: Ensure subject teachers enter period attendance by 4:00 PM daily. Mark pending sessions or notify absent faculty substitutes.
2. Mentorship & Counseling: Conduct bi-weekly mentor-mentee meetings with assigned class students. Address academic backlogs and grievance reports.
3. Class Committee Meetings: Organize three Class Committee Meetings (CCM) per semester to gather student feedback on syllabus completion pace.
4. Parent Communication: Dispatch bi-monthly attendance progress and midterm mark sheets to registered parent email addresses.
5. Examination Form Verification: Scrutinize examination enrollment forms and verify student eligibility criteria before HOD and Principal endorsement.`,
      },
    ];

    for (const doc of seedDocs) {
      await this.indexDocument({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async indexDocument(doc: KnowledgeDocument) {
    this.documents.set(doc.id, doc);
    vectorStore.deleteChunksByDocumentId(doc.id);

    // Split text into chunks
    const chunkTexts = chunkText(doc.content, { maxChunkSize: 450, overlap: 80 });

    const chunksToInsert: DocumentChunk[] = [];
    for (let i = 0; i < chunkTexts.length; i++) {
      const text = chunkTexts[i];
      // Generate embedding vector
      const embedding = await aiEngine.generateEmbeddings(text);

      chunksToInsert.push({
        id: `chunk-${doc.id}-${i}`,
        documentId: doc.id,
        chunkIndex: i,
        text,
        embedding,
        category: doc.category,
        title: doc.title,
        documentName: doc.documentName,
        departmentId: doc.departmentId,
      });
    }

    vectorStore.addChunks(chunksToInsert);
  }

  async search(query: string, departmentId?: string | null, topK = 4): Promise<RAGSearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const queryEmbedding = await aiEngine.generateEmbeddings(query);
    return vectorStore.search(queryEmbedding, query, topK, departmentId);
  }

  getDocuments(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }

  getDocument(id: string): KnowledgeDocument | undefined {
    return this.documents.get(id);
  }
}

export const ragKnowledgeEngine = new RAGKnowledgeEngine();

// Auto-initialize knowledge store in background
ragKnowledgeEngine.initialize().catch((err) => {
  console.warn('[RAG] Failed to seed knowledge documents:', err.message);
});

export default ragKnowledgeEngine;
