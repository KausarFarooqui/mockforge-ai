import json
import hashlib
from pathlib import Path
from config import RENDERS_DIR, TEMP_SCRIPTS_DIR, RENDER_SAMPLES, RENDER_RESOLUTION

COLOR_MAP = {
    "white": (0.9, 0.9, 0.9, 1.0),
    "black": (0.05, 0.05, 0.05, 1.0),
    "red": (0.8, 0.1, 0.1, 1.0),
    "blue": (0.1, 0.2, 0.8, 1.0),
    "green": (0.1, 0.6, 0.2, 1.0),
    "silver": (0.7, 0.7, 0.75, 1.0),
    "gold": (0.83, 0.68, 0.21, 1.0),
    "pink": (0.9, 0.5, 0.6, 1.0),
    "purple": (0.5, 0.1, 0.7, 1.0),
    "orange": (0.9, 0.4, 0.1, 1.0),
    "gray": (0.4, 0.4, 0.4, 1.0),
    "grey": (0.4, 0.4, 0.4, 1.0),
    "brown": (0.4, 0.25, 0.1, 1.0),
    "warm brown": (0.45, 0.28, 0.12, 1.0),
    "warm white": (1.0, 0.97, 0.9, 1.0),
    "cool blue": (0.7, 0.8, 1.0, 1.0),
    "golden": (1.0, 0.85, 0.4, 1.0),
    "neutral": (0.95, 0.95, 0.95, 1.0),
    "marble": (0.85, 0.83, 0.80, 1.0),
    "concrete": (0.5, 0.5, 0.5, 1.0),
}

MATERIAL_PARAMS = {
    "plastic": {"metallic": 0.0, "roughness": 0.3},
    "glass":   {"metallic": 0.0, "roughness": 0.0, "transmission": 0.95},
    "metal":   {"metallic": 1.0, "roughness": 0.15},
    "leather": {"metallic": 0.0, "roughness": 0.7},
    "fabric":  {"metallic": 0.0, "roughness": 0.9},
    "ceramic": {"metallic": 0.0, "roughness": 0.1},
    "wood":    {"metallic": 0.0, "roughness": 0.8},
    "rubber":  {"metallic": 0.0, "roughness": 0.95},
}

PRODUCT_PRIMITIVES = {
    "smartphone": ("bpy.ops.mesh.primitive_cube_add",     {"size": 1},                                (0.38, 0.78, 0.08)),
    "bottle":     ("bpy.ops.mesh.primitive_cylinder_add", {"radius": 0.15, "depth": 1.0},             (1, 1, 1)),
    "cup":        ("bpy.ops.mesh.primitive_cylinder_add", {"radius": 0.18, "depth": 0.5},             (1, 1, 1)),
    "watch":      ("bpy.ops.mesh.primitive_cylinder_add", {"radius": 0.22, "depth": 0.06},            (1, 1, 1)),
    "book":       ("bpy.ops.mesh.primitive_cube_add",     {"size": 1},                                (0.7, 1.0, 0.1)),
    "bag":        ("bpy.ops.mesh.primitive_cube_add",     {"size": 1},                                (0.5, 0.7, 0.4)),
    "shoe":       ("bpy.ops.mesh.primitive_cube_add",     {"size": 1},                                (0.7, 0.35, 0.3)),
    "headphones": ("bpy.ops.mesh.primitive_torus_add",    {"major_radius": 0.4, "minor_radius": 0.1}, (1, 1, 1)),
    "laptop":     ("bpy.ops.mesh.primitive_cube_add",     {"size": 1},                                (1.2, 0.8, 0.03)),
    "perfume":    ("bpy.ops.mesh.primitive_cylinder_add", {"radius": 0.1, "depth": 0.7},              (1, 1, 1)),
    "product":    ("bpy.ops.mesh.primitive_cube_add",     {"size": 1},                                (1, 1, 1)),
}

LIGHTING_CONFIGS = {
    "soft studio": [
        {"type": "AREA", "energy": 400, "pos": (3, -3, 5),  "size": 4.0, "color": (1.0, 0.97, 0.9), "rot": (-45, 0, 0)},
        {"type": "AREA", "energy": 150, "pos": (-4, 2, 4),  "size": 3.0, "color": (0.8, 0.85, 1.0), "rot": (-45, 0, 60)},
        {"type": "AREA", "energy": 60,  "pos": (0, 5, 2),   "size": 2.0, "color": (1.0, 1.0, 1.0),  "rot": (-90, 0, 0)},
    ],
    "dramatic side": [
        {"type": "AREA", "energy": 1200, "pos": (-5, 0, 3), "size": 1.5, "color": (1.0, 0.95, 0.8), "rot": (-45, 0, 90)},
        {"type": "AREA", "energy": 80,   "pos": (5, 0, 2),  "size": 2.0, "color": (0.4, 0.5, 0.8),  "rot": (-45, 0, -90)},
    ],
    "golden hour": [
        {"type": "AREA", "energy": 800, "pos": (5, -2, 2),  "size": 2.0, "color": (1.0, 0.7, 0.3),  "rot": (-60, 0, -30)},
        {"type": "AREA", "energy": 100, "pos": (-3, 3, 4),  "size": 3.0, "color": (0.6, 0.7, 1.0),  "rot": (-45, 0, 60)},
    ],
    "neon": [
        {"type": "AREA", "energy": 300, "pos": (3, -2, 3),  "size": 1.0, "color": (1.0, 0.0, 0.5),  "rot": (-45, 0, -30)},
        {"type": "AREA", "energy": 300, "pos": (-3, 2, 3),  "size": 1.0, "color": (0.0, 0.5, 1.0),  "rot": (-45, 0, 30)},
        {"type": "AREA", "energy": 50,  "pos": (0, 0, 5),   "size": 2.0, "color": (1.0, 1.0, 1.0),  "rot": (0, 0, 0)},
    ],
    "minimalist white": [
        {"type": "AREA", "energy": 600, "pos": (0, 0, 6),   "size": 6.0, "color": (1.0, 1.0, 1.0),  "rot": (0, 0, 0)},
        {"type": "AREA", "energy": 200, "pos": (4, -4, 4),  "size": 3.0, "color": (1.0, 1.0, 1.0),  "rot": (-45, 0, -45)},
    ],
}

CAMERA_CONFIGS = {
    "45 degree product shot": {"pos": (3.5, -3.5, 2.5), "fov": 50},
    "front view":             {"pos": (0, -5, 1.2),     "fov": 45},
    "top-down flat lay":      {"pos": (0, 0, 6),        "fov": 60},
    "close-up macro":         {"pos": (2, -2, 1.5),     "fov": 30},
    "three-quarter view":     {"pos": (2.5, -4, 2),     "fov": 50},
}


def _get_color(name):
    name_lower = name.lower()
    for key, val in COLOR_MAP.items():
        if key in name_lower:
            return val
    return (0.8, 0.8, 0.8, 1.0)


def _get_material_params(material):
    for key in MATERIAL_PARAMS:
        if key in material.lower():
            return MATERIAL_PARAMS[key]
    return MATERIAL_PARAMS["plastic"]


def _get_lighting(style):
    style_lower = style.lower()
    for key in LIGHTING_CONFIGS:
        if any(word in style_lower for word in key.split()):
            return LIGHTING_CONFIGS[key]
    return LIGHTING_CONFIGS["soft studio"]


def _get_camera(angle):
    angle_lower = angle.lower()
    for key in CAMERA_CONFIGS:
        if any(word in angle_lower for word in key.split()):
            return CAMERA_CONFIGS[key]
    return CAMERA_CONFIGS["45 degree product shot"]


def _get_product_primitive(product):
    for key in PRODUCT_PRIMITIVES:
        if key in product.lower():
            return PRODUCT_PRIMITIVES[key]
    return PRODUCT_PRIMITIVES["product"]


def build_scene_script(params, output_path):
    product_color = _get_color(params.get("product_color", "white"))
    surface_color = _get_color(params.get("surface_color", "warm brown"))
    mat_params    = _get_material_params(params.get("product_material", "plastic"))
    lights        = _get_lighting(params.get("lighting", "soft studio"))
    camera        = _get_camera(params.get("camera_angle", "45 degree product shot"))
    prim_fn, prim_kwargs, prim_scale = _get_product_primitive(params.get("product", "product"))

    metallic     = mat_params.get("metallic", 0.0)
    roughness    = mat_params.get("roughness", 0.3)
    transmission = mat_params.get("transmission", 0.0)
    kwargs_str   = ", ".join(f"{k}={v}" for k, v in prim_kwargs.items())
    output_safe  = output_path.replace("\\", "/")
    cam_pos      = camera["pos"]
    cam_fov      = camera["fov"]

    # Build light code as plain top-level statements
    light_lines = []
    for i, light in enumerate(lights):
        px, py, pz = light["pos"]
        cr, cg, cb = light["color"]
        rx, ry, rz = light.get("rot", (-45, 0, 0))
        light_lines.append(f"bpy.ops.object.light_add(type='{light['type']}', location=({px}, {py}, {pz}))")
        light_lines.append(f"_lt = bpy.context.object")
        light_lines.append(f"_lt.name = 'Light{i}'")
        light_lines.append(f"_lt.data.energy = {light['energy']}")
        light_lines.append(f"_lt.data.color = ({cr}, {cg}, {cb})")
        if light["type"] == "AREA":
            light_lines.append(f"_lt.data.size = {light.get('size', 2.0)}")
        light_lines.append(f"_lt.rotation_euler = (math.radians({rx}), math.radians({ry}), math.radians({rz}))")
        light_lines.append("")
    light_code = "\n".join(light_lines)

    lines = []
    lines.append("import bpy")
    lines.append("import math")
    lines.append("import mathutils")
    lines.append("")
    lines.append("bpy.ops.wm.read_factory_settings(use_empty=True)")
    lines.append("scene = bpy.context.scene")
    lines.append("scene.render.engine = 'CYCLES'")
    lines.append(f"scene.cycles.samples = {RENDER_SAMPLES}")
    lines.append(f"scene.render.resolution_x = {RENDER_RESOLUTION}")
    lines.append(f"scene.render.resolution_y = {RENDER_RESOLUTION}")
    lines.append("scene.render.image_settings.file_format = 'PNG'")
    lines.append(f'scene.render.filepath = "{output_safe}"')
    lines.append("scene.cycles.device = 'CPU'")
    lines.append("")
    lines.append("")
    lines.append("def make_material(name, base_color, metallic=0.0, roughness=0.3, transmission=0.0):")
    lines.append("    mat = bpy.data.materials.new(name=name)")
    lines.append("    mat.use_nodes = True")
    lines.append("    nodes = mat.node_tree.nodes")
    lines.append("    links = mat.node_tree.links")
    lines.append("    nodes.clear()")
    lines.append("    out = nodes.new('ShaderNodeOutputMaterial')")
    lines.append("    bsdf = nodes.new('ShaderNodeBsdfPrincipled')")
    lines.append("    bsdf.inputs['Base Color'].default_value = base_color")
    lines.append("    bsdf.inputs['Metallic'].default_value = metallic")
    lines.append("    bsdf.inputs['Roughness'].default_value = roughness")
    lines.append("    if transmission > 0:")
    lines.append("        try:")
    lines.append("            bsdf.inputs['Transmission Weight'].default_value = transmission")
    lines.append("        except Exception:")
    lines.append("            try:")
    lines.append("                bsdf.inputs['Transmission'].default_value = transmission")
    lines.append("            except Exception:")
    lines.append("                pass")
    lines.append("        mat.blend_method = 'BLEND'")
    lines.append("    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])")
    lines.append("    return mat")
    lines.append("")
    lines.append("bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))")
    lines.append("floor = bpy.context.object")
    lines.append("floor.name = 'Floor'")
    lines.append(f"floor.data.materials.append(make_material('FloorMat', {surface_color}, roughness=0.85))")
    lines.append("")
    lines.append("bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 5, 5))")
    lines.append("wall = bpy.context.object")
    lines.append("wall.name = 'BackWall'")
    lines.append("wall.rotation_euler = (math.radians(90), 0, 0)")
    lines.append(f"wall.data.materials.append(make_material('WallMat', {surface_color}, roughness=0.9))")
    lines.append("")
    lines.append(f"{prim_fn}(location=(0, 0, 0.5), {kwargs_str})")
    lines.append("product = bpy.context.object")
    lines.append("product.name = 'Product'")
    lines.append(f"product.scale = {prim_scale}")
    lines.append("bpy.ops.object.shade_smooth()")
    lines.append("sub = product.modifiers.new('Subsurf', 'SUBSURF')")
    lines.append("sub.levels = 2")
    lines.append(f"product.data.materials.append(make_material('ProductMat', {product_color}, metallic={metallic}, roughness={roughness}, transmission={transmission}))")
    lines.append("")
    lines.append(light_code)
    lines.append("")
    lines.append("world = bpy.data.worlds.new('World')")
    lines.append("scene.world = world")
    lines.append("world.use_nodes = True")
    lines.append("bg = world.node_tree.nodes.get('Background')")
    lines.append("if bg:")
    lines.append("    bg.inputs['Color'].default_value = (0.05, 0.05, 0.07, 1.0)")
    lines.append("    bg.inputs['Strength'].default_value = 0.3")
    lines.append("")
    lines.append("cam_data = bpy.data.cameras.new('Camera')")
    lines.append("cam_data.lens_unit = 'FOV'")
    lines.append(f"cam_data.angle = math.radians({cam_fov})")
    lines.append("cam_data.dof.use_dof = True")
    lines.append("cam_data.dof.aperture_fstop = 2.8")
    lines.append("cam_obj = bpy.data.objects.new('Camera', cam_data)")
    lines.append("bpy.context.collection.objects.link(cam_obj)")
    lines.append(f"cam_obj.location = ({cam_pos[0]}, {cam_pos[1]}, {cam_pos[2]})")
    lines.append("scene.camera = cam_obj")
    lines.append(f"_dir = mathutils.Vector((0 - {cam_pos[0]}, 0 - {cam_pos[1]}, 0.5 - {cam_pos[2]}))")
    lines.append("cam_obj.rotation_euler = _dir.to_track_quat('-Z', 'Y').to_euler()")
    lines.append("cam_data.dof.focus_object = product")
    lines.append("")
    lines.append("print('[MockForge] Starting render...')")
    lines.append("bpy.ops.render.render(write_still=True)")
    lines.append("print('[MockForge] Render complete!')")

    return "\n".join(lines)


def generate_script_file(params, render_id):
    output_path  = str(RENDERS_DIR / f"{render_id}.png")
    script_path  = str(TEMP_SCRIPTS_DIR / f"{render_id}.py")
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(build_scene_script(params, output_path))
    return script_path, output_path


def get_render_id(params):
    key = json.dumps(params, sort_keys=True)
    return hashlib.md5(key.encode()).hexdigest()

