import os
import re

directory = r'e:\gym\GymManagment\backend\GymUserManagement\src\main\java\com\gymbross\usermanagement'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    content = re.sub(r'\bTrainer\b', 'User', content)
    content = re.sub(r'\bAdmin\b', 'User', content)
    content = re.sub(r'\bStaff\b', 'User', content)
    content = re.sub(r'\bPremiumUser\b', 'User', content)
    
    # Repositories usages
    content = re.sub(r'adminRepository\.', 'userRepository.', content)
    content = re.sub(r'trainerRepository\.', 'userRepository.', content)
    content = re.sub(r'staffRepository\.', 'userRepository.', content)
    content = re.sub(r'premiumUserRepository\.', 'userRepository.', content)

    # Repository declarations
    content = re.sub(r'private final AdminRepository adminRepository;\n?', '', content)
    content = re.sub(r'private final TrainerRepository trainerRepository;\n?', '', content)
    content = re.sub(r'private final StaffRepository staffRepository;\n?', '', content)
    content = re.sub(r'private final PremiumUserRepository premiumUserRepository;\n?', '', content)

    # Imports
    content = re.sub(r'import com\.Gym\.GymCommonServices\.entity\.(Trainer|Admin|Staff|PremiumUser);\n?', '', content)
    content = re.sub(r'import com\.gymbross\.usermanagement\.repository\.(Admin|Trainer|Staff|PremiumUser)Repository;\n?', '', content)

    # Enum Role
    content = re.sub(r'\bRole\.\w+\b', '"USER"', content)
    content = re.sub(r'\bRole\b', 'String', content)
    content = re.sub(r'import com\.Gym\.GymCommonServices\.entity\.Role;\n?', '', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))

print("Refactoring complete.")
