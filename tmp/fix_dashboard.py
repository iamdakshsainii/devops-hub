import re

path = r"c:\my-stuff\devops-hub\src\app\dashboard\page.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''(\s*<Link href="/roadmap">\s*<Button variant="secondary" className="rounded-full">View Roadmap</Button>\s*</Link>\s*</div>)'''

insert = r'''\n               {session?.user?.role === "MEMBER" && (
                 <Link href="/request-admin">
                    <Button variant="outline" className="rounded-full border-amber-500/20 hover:bg-amber-500/10 text-amber-500"><Shield className="h-4 w-4 mr-1.5" /> Apply for Admin</Button>
                 </Link>
               )}\1'''

content_new = re.sub(pattern, insert, content)

if content_new != content:
    with open(path, 'w', encoding='utf-8') as f:
         f.write(content_new)
    print("Success")
else:
    print("Failed")
