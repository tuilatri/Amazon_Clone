# Fixed script to update Navigation.js with AuthContext
import re

# Read the original file
with open(r'f:\Amazon_Clone\frontend\src\Components\Navbar\Navigation.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for useAuth
if 'import { useAuth }' not in content:
    content = content.replace(
        "import { callAPI } from '../../Utils/CallAPI';",
        "import { callAPI } from '../../Utils/CallAPI';\nimport { useAuth } from '../../Context/AuthContext';"
    )

# 2. Replace NavBar function signature - FIXED VERSION
# Find and replace the entire section from NavBar declaration to handleNavigate
pattern = r'const NavBar = \(\{ userInfo \}\) => \{[\s\S]*?const handleNavigate = \(\) => \{[\s\S]*?\};'
replacement = '''const NavBar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [category, setCategory] = useState("All");

    const handleNavigate = () => {
        navigate('/');
    };'''

content = re.sub(pattern, replacement, content, count=1)

# 3. Update handleCategorySelect - remove state passing
content = re.sub(
    r"navigate\(`/Homepage/\$\{mainCategoryEncoded\}`, \{ state: \{ userData: \{ \.\.\.userData \} \} \}\);",
    r"navigate(`/Homepage/${mainCategoryEncoded}`);",
    content
)

# 4. Update handleProfileClick - remove state passing
content = re.sub(
    r'const handleProfileClick = \(\) => \{[\s\S]*?\};',
    '''const handleProfileClick = () => {
        navigate('/UserPage');
    };''',
    content,
    count=1
)

# 5. Update handleLogOutClick
content = re.sub(
    r'const handleLogOutClick = \(\) => \{[\s\S]*?\};',
    '''const handleLogOutClick = () => {
        logout();
        navigate('/');
    };''',
    content,
    count=1
)

# 6. Update onHandleSubmit - remove state passing
content = re.sub(
    r'navigate\(\{[\s\S]*?pathname: "/search",[\s\S]*?search: `\?\$\{createSearchParams\(\{ category, searchTerm \}\)\}`,[\s\S]*?\}, \{[\s\S]*?state: \{ userData \},[\s\S]*?\}\);',
    '''navigate({
            pathname: "/search",
            search: `?${createSearchParams({ category, searchTerm })}`,
        });''',
    content
)

# 7. Update account section display name
content = content.replace(
    '{userData?.name ? `Hello, ${userData.name}` : "Hello, User"}',
    '{isAuthenticated && user ? `Hello, ${user.user_name}` : "Hello, Sign in"}'
)

# 8. Update account dropdown condition
content = content.replace(
    '{!userData?.name ? (',
    '{!isAuthenticated ? ('
)

# 9. Remove state from Cart Link
content = re.sub(
    r'to=\{\{[\s\S]*?pathname: "/Cart",[\s\S]*?\}\}[\s\S]*?state=\{\{ userData \}\}',
    'to="/Cart"',
    content
)

# Write the updated content
with open(r'f:\Amazon_Clone\frontend\src\Components\Navbar\Navigation.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Navigation.js updated successfully (fixed version)!")
