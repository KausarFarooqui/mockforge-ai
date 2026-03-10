import pathlib

f = pathlib.Path('blender_runner.py')
t = f.read_text(encoding='utf-8')
t = t.replace(
    "stdout_str = stdout.decode('utf-8', errors='replace')",
    "stdout_str = stdout.decode('utf-8', errors='replace').encode('ascii', errors='replace').decode('ascii')"
).replace(
    "stderr_str = stderr.decode('utf-8', errors='replace')",
    "stderr_str = stderr.decode('utf-8', errors='replace').encode('ascii', errors='replace').decode('ascii')"
)
f.write_text(t, encoding='utf-8')
print('blender_runner.py fixed')

f2 = pathlib.Path('scene_builder.py')
t2 = f2.read_text(encoding='utf-8')
t2 = t2.replace("with open(script_path, 'w') as f:", "with open(script_path, 'w', encoding='utf-8') as f:")
f2.write_text(t2, encoding='utf-8')
print('scene_builder.py fixed')
