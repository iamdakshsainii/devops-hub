import re

def fix_navbar():
    path = r"c:\my-stuff\devops-hub\src\components\navbar.tsx"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    landmark = '''                    {["ADMIN", "SUPER_ADMIN"].includes(session.user.role) && (
                      <DropdownMenuItem className="cursor-pointer" asChild>
                       <Link href="/admin" className="flex items-center w-full"><Shield className="mr-2 h-4 w-4" /> Moderation Panel</Link>
                     </DropdownMenuItem>
                   )}'''
    
    # Let's use flexible regex replacement
    pattern = r'''(\s*\{\["ADMIN", "SUPER_ADMIN"\]\.includes\(session\.user\.role\) && \(\s*<DropdownMenuItem className="cursor-pointer" asChild>\s*<Link href="/admin" className="flex items-center w-full"><Shield className="mr-2 h-4 w-4" /> Moderation Panel</Link>\s*</DropdownMenuItem>\s*\)\})'''
    
    insert = '''
                    {session.user.role === "MEMBER" && (
                     <DropdownMenuItem className="cursor-pointer text-amber-500 font-semibold" asChild>
                        <Link href="/request-admin" className="flex items-center w-full"><Shield className="mr-2 h-4 w-4" /> Apply for Admin</Link>
                     </DropdownMenuItem>
                    )}
'''
    content_new = re.sub(pattern, insert + r'\1', content)
    
    if content_new != content:
        with open(path, 'w', encoding='utf-8') as f:
             f.write(content_new)
        print("Navbar updated")
    else:
        print("Landmark not found in Navbar")

fix_navbar()
