import { NextResponse } from "next/server";
// Database maintenance must be performed through an explicit offline command.
// The former public GET endpoint could delete live community data.
export async function GET(){
 return NextResponse.json({error:"Public database maintenance is disabled."},{status:410});
}
