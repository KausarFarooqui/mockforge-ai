import pathlib, re

f = pathlib.Path('scene_builder.py')
t = f.read_text(encoding='utf-8')

old = '''    light_code = ""
    for i, light in enumerate(lights):
        pos = light["pos"]
        color = light.get("color", (1, 1, 1))
        if light["type"] == "AREA":
            light_code += f"""
    bpy.ops.object.light_add(type=\'AREA\', location=({pos[0]}, {pos[1]}, {pos[2]}))
    light_{i} = bpy.context.object
    light_{i}.data.energy = {light[\'energy\']}
    light_{i}.data.size = {light.get(\'size\', 2.0)}
    light_{i}.data.color = ({color[0]}, {color[1]}, {color[2]})
    light_{i}.rotation_euler = (math.radians(-45), 0, math.radians({30 * i}))
"""
        elif light["type"] == "SPOT":
            light_code += f"""
    bpy.ops.object.light_add(type=\'SPOT\', location=({pos[0]}, {pos[1]}, {pos[2]}))
    light_{i} = bpy.context.object
    light_{i}.data.energy = {light[\'energy\']}
    light_{i}.data.spot_size = 1.0
    light_{i}.data.color = ({color[0]}, {color[1]}, {color[2]})
    light_{i}.rotation_euler = (math.radians(60), 0, math.radians(-30))
"""
        elif light["type"] == "SUN":
            light_code += f"""
    bpy.ops.object.light_add(type=\'SUN\', location=({pos[0]}, {pos[1]}, {pos[2]}))
    light_{i} = bpy.context.object
    light_{i}.data.energy = {light[\'energy\']}
    light_{i}.data.color = ({color[0]}, {color[1]}, {color[2]})
    light_{i}.rotation_euler = (math.radians(60), 0, math.radians(30))
"""'''

new = '''    light_code = ""
    for i, light in enumerate(lights):
        pos = light["pos"]
        color = light.get("color", (1, 1, 1))
        if light["type"] == "AREA":
            light_code += f"bpy.ops.object.light_add(type=\'AREA\', location=({pos[0]}, {pos[1]}, {pos[2]}))\\n"
            light_code += f"light_{i} = bpy.context.object\\n"
            light_code += f"light_{i}.data.energy = {light[\'energy\']}\\n"
            light_code += f"light_{i}.data.size = {light.get(\'size\', 2.0)}\\n"
            light_code += f"light_{i}.data.color = ({color[0]}, {color[1]}, {color[2]})\\n"
            light_code += f"light_{i}.rotation_euler = (math.radians(-45), 0, math.radians({30 * i}))\\n"
        elif light["type"] == "SPOT":
            light_code += f"bpy.ops.object.light_add(type=\'SPOT\', location=({pos[0]}, {pos[1]}, {pos[2]}))\\n"
            light_code += f"light_{i} = bpy.context.object\\n"
            light_code += f"light_{i}.data.energy = {light[\'energy\']}\\n"
            light_code += f"light_{i}.data.spot_size = 1.0\\n"
            light_code += f"light_{i}.data.color = ({color[0]}, {color[1]}, {color[2]})\\n"
            light_code += f"light_{i}.rotation_euler = (math.radians(60), 0, math.radians(-30))\\n"
        elif light["type"] == "SUN":
            light_code += f"bpy.ops.object.light_add(type=\'SUN\', location=({pos[0]}, {pos[1]}, {pos[2]}))\\n"
            light_code += f"light_{i} = bpy.context.object\\n"
            light_code += f"light_{i}.data.energy = {light[\'energy\']}\\n"
            light_code += f"light_{i}.data.color = ({color[0]}, {color[1]}, {color[2]})\\n"
            light_code += f"light_{i}.rotation_euler = (math.radians(60), 0, math.radians(30))\\n"'''

if old in t:
    t = t.replace(old, new)
    f.write_text(t, encoding='utf-8')
    print('scene_builder.py fixed successfully')
else:
    print('Pattern not found - manual fix needed')
