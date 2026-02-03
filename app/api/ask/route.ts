import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      // Demo mode response when API key is not configured
      console.log("[v0] No GROQ_API_KEY found, returning demo response")
      const demoResponse = getDemoResponse(message)
      return Response.json({ reply: demoResponse })
      
    }

    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a professional AI Legal Assistant. Provide general legal information and guidance based on the user's questions. 
      Always include appropriate disclaimers that you cannot provide professional legal advice. 
      Keep responses clear, concise, and well-structured. Reference relevant laws and legal principles when appropriate.`,
      prompt: message,
    })

    return Response.json({ reply: response.text })

  } catch (error) {
    console.error("[v0] API Error:", error)
    // Return a user-friendly error message
    return Response.json(
      { error: "Failed to process your request. Please check that your API key is configured correctly." },
      { status: 500 },
    )
  }
}

// Demo responses when API key is not configured
function getDemoResponse(message: string): string {
  const demos: Record<string, string> = {
    contract: `Based on your question about contracts, here are some key points:

1. **Elements of a Valid Contract**: A contract requires offer, acceptance, consideration, and intent to create legal relations.

2. **Contract Types**: Contracts can be written, oral, or implied by conduct.

3. **Enforcement**: Contracts are enforceable through breach remedies like damages, specific performance, or injunctions.

**Important Disclaimer**: This is general legal information only. For specific contract issues, consult a qualified attorney in your jurisdiction.`,

    divorce: `Regarding family law matters:

1. **Grounds for Divorce**: Most jurisdictions allow no-fault divorce based on irreconcilable differences.

2. **Asset Division**: Courts typically divide marital property equitably or equally depending on jurisdiction.

3. **Child Custody**: Decisions prioritize the best interests of the child.

**Important Note**: Family law varies significantly by location. Consult a family law attorney for personalized advice.`,

    tenant: `Concerning tenant rights:

1. **Lease Agreements**: Landlords must follow lease terms and local housing laws.

2. **Security Deposits**: Must be held in separate accounts and returned within legal timeframes.

3. **Eviction Process**: Landlords must follow formal eviction procedures; "self-help" evictions are illegal.

**Disclaimer**: Tenant-landlord law varies by jurisdiction. Contact a local attorney for specific situations.`,
  }

  const lowerMessage = message.toLowerCase()
  for (const [key, value] of Object.entries(demos)) {
    if (lowerMessage.includes(key)) {
      return value
    }
  }

  return `Thank you for your question about legal matters.

General Legal Information:
- Always seek professional legal advice for serious matters
- Laws vary significantly by jurisdiction
- This AI provides educational information only

Common Legal Areas:
- Contract Law
- Family Law
- Tenant Rights
- Employment Law
- Criminal Law

**Important**: This is not legal advice. Consult a licensed attorney for your specific situation.

To get started, ask me about contract law, family law, tenant rights, or other legal topics.`
}
