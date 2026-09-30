import { NextResponse } from "next/server";
export async function GET(){
 return NextResponse.json({error:"Public credential diagnostics are disabled."},{status:410});
}
