import { IssueDetail } from "@/components/client/issue-detail"

export default async function IssueDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <div className="space-y-6">
      <IssueDetail issueId={id} />
    </div>
  )
}
