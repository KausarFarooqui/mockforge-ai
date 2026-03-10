content = open('C:/Users/faroo/Downloads/mockforge-ai/backend/replicate_runner.py', encoding='utf-8').read()
content = content.replace(
    'https://api.replicate.com/v1/models/stability-ai/sdxl/versions/7762fd07cf82c948538e41f63f77d685e02b063e37291cf26e39f4c7bfaa8d97/predictions',
    'https://api.replicate.com/v1/predictions'
)
content = content.replace(
    'payload = {\n        "input": {',
    'payload = {\n        "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",\n        "input": {'
)
open('C:/Users/faroo/Downloads/mockforge-ai/backend/replicate_runner.py', 'w', encoding='utf-8').write(content)
print('Done!')
