# Script to update Navigation.js with AuthContext
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

# 2. Replace NavBar function signature and remove userData state
content = re.sub(
    r'const NavBar = \(\{ userInfo \}\) => \{[\s\S]*?const \[category, setCategory\] = useState\("All"\);[\s\S]*?\}\);',
    '''const NavBar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [category, setCategory] = useState("All");

    const handleNavigate = () => {
        navigate('/');
    };''',
    content,
    count=1
)

# 3. Update handleCategorySelect
content = re.sub(
    r'const handleCategorySelect = \(categoryTitle\) => \{[\s\S]*?setShowAll\(false\);[\s\S]*?\};',
    '''const handleCategorySelect = (categoryTitle) => {
        const mainCategoryEncoded = categoryMapping[categoryTitle];
        if (mainCategoryEncoded === undefined) {
            console.error("Category title not found in mapping:", categoryTitle);
            return;
        }
        navigate(`/Homepage/${mainCategoryEncoded}`);
        setShowAll(false);
    };''',
    content,
    count=1
)

# 4. Update handleProfileClick
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

# 6. Update onHandleSubmit
content = re.sub(
    r'const onHandleSubmit = \(e\) => \{[\s\S]*?setCategory\("All"\);[\s\S]*?\};',
    '''const onHandleSubmit = (e) => {
        e.preventDefault();
        navigate({
            pathname: "/search",
            search: `?${createSearchParams({ category, searchTerm })}`,
        });
        setSearchTerm("");
        setCategory("All");
    };''',
    content,
    count=1
)

# 7. Update account section display
content = re.sub(
    r'\{userData\?\.name \? `Hello, \$\{userData\.name\}` : "Hello, User"\}',
    r'{isAuthenticated && user ? `Hello, ${user.user_name}` : "Hello, Sign in"}',
    content
)

# 8. Update account dropdown condition
content = re.sub(
    r'\{!userData\?\.name \?',
    r'{!isAuthenticated ?',
    content
)

# 9. Remove state from Cart Link
content = re.sub(
    r'state=\{\{ userData \}\} // Pass userData via state',
    '',
    content
)

# Write the updated content
with open(r'f:\Amazon_Clone\frontend\src\Components\Navbar\Navigation.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Navigation.js updated successfully!")
