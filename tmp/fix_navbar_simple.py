path = r"c:\my-stuff\devops-hub\src\components\navbar.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

landmark = '<Link href="/dashboard" className="cursor-pointer w-full">Dashboard</Link>\n                    </DropdownMenuItem>'

insert = '''\n                    {session?.user.role === "MEMBER" && (
                      <DropdownMenuItem className="cursor-pointer text-amber-500 font-semibold" asChild>
                        <Link href="/request-admin" className="flex items-center w-full">
                          <Shield className="mr-2 h-4 w-4" /> Apply for Admin
                        </Link>
                      </DropdownMenuItem>
                    )}'''

if landmark in content:
    content = content.replace(landmark, landmark + insert)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    # Try finding without \n spaces
    print("Landmark not found")
