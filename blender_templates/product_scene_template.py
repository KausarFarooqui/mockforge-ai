#!/usr/bin/env python3
"""
MockForge AI - Blender Scene Template
This is the base template used by scene_builder.py.
All parameters are injected at runtime.

To test manually:
  blender --background --python product_scene_template.py
"""

import bpy
import math
import mathutils

# ── SCENE SETUP ──────────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.render.resolution_x = 2048
scene.render.resolution_y = 2048
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = "//renders/template_output.png"
scene.cycles.use_denoising = True

# ── MATERIAL HELPER ──────────────────────────────────────────────────────────
def make_principled_mat(name, base_color, metallic=0.0, roughness=0.3,
                         specular=0.5, transmission=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    principled = nodes.new('ShaderNodeBsdfPrincipled')
    principled.location = (-200, 0)
    output.location = (100, 0)

    principled.inputs['Base Color'].default_value = base_color
    principled.inputs['Metallic'].default_value = metallic
    principled.inputs['Roughness'].default_value = roughness
    principled.inputs['Specular'].default_value = specular

    if transmission > 0:
        principled.inputs['Transmission'].default_value = transmission
        principled.inputs['IOR'].default_value = 1.45
        mat.blend_method = 'BLEND'

    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    return mat

# ── FLOOR ─────────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))
floor = bpy.context.object
floor.name = "Floor"
floor.data.materials.append(
    make_principled_mat("FloorMat", (0.45, 0.28, 0.12, 1.0),
                        roughness=0.85, specular=0.05)
)

# ── BACK WALL ─────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 5, 5))
wall = bpy.context.object
wall.name = "BackWall"
wall.rotation_euler = (math.radians(90), 0, 0)
wall.data.materials.append(
    make_principled_mat("WallMat", (0.45, 0.28, 0.12, 1.0),
                        roughness=0.9, specular=0.02)
)

# ── PRODUCT (smartphone stand-in) ────────────────────────────────────────────
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
product = bpy.context.object
product.name = "Product"
product.scale = (0.38, 0.78, 0.08)
bpy.ops.object.shade_smooth()
sub = product.modifiers.new("Subsurf", 'SUBSURF')
sub.levels = 2
product.data.materials.append(
    make_principled_mat("ProductMat", (0.9, 0.9, 0.9, 1.0),
                        metallic=0.0, roughness=0.3, specular=0.5)
)

# ── STUDIO LIGHTS ─────────────────────────────────────────────────────────────
lights_cfg = [
    {"pos": (3, -3, 5),  "energy": 400, "size": 4.0, "color": (1.0, 0.97, 0.9)},
    {"pos": (-4, 2, 4),  "energy": 150, "size": 3.0, "color": (0.8, 0.85, 1.0)},
    {"pos": (0, 5, 2),   "energy": 60,  "size": 2.0, "color": (1.0, 1.0, 1.0)},
]
for i, cfg in enumerate(lights_cfg):
    bpy.ops.object.light_add(type='AREA', location=cfg["pos"])
    light = bpy.context.object
    light.data.energy = cfg["energy"]
    light.data.size = cfg["size"]
    light.data.color = cfg["color"]

# ── WORLD ─────────────────────────────────────────────────────────────────────
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
if bg:
    bg.inputs['Color'].default_value = (0.05, 0.05, 0.07, 1.0)
    bg.inputs['Strength'].default_value = 0.3

# ── CAMERA ─────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens_unit = 'FOV'
cam_data.angle = math.radians(50)
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 2.8

cam_obj = bpy.data.objects.new("Camera", cam_data)
bpy.context.collection.objects.link(cam_obj)
cam_pos = (3.5, -3.5, 2.5)
cam_obj.location = cam_pos
scene.camera = cam_obj

direction = mathutils.Vector((0 - cam_pos[0], 0 - cam_pos[1], 0.5 - cam_pos[2]))
cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
cam_data.dof.focus_object = product

# ── RENDER ─────────────────────────────────────────────────────────────────────
bpy.ops.render.render(write_still=True)
print("[MockForge] Template render complete!")
