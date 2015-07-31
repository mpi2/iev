from vispy import scene
from vispy.color import BaseColormap
import SimpleITK as sitk
from matplotlib import pyplot as plt
import numpy as np
import sys

class VolumeRendering(scene.SceneCanvas):

    def __init__(self, title='Volume rendering', size=(800, 600), position=None,
                 show=False, autoswap=True, app=None, create_native=True,
                 vsync=False, resizable=True, decorate=True, fullscreen=False,
                 config=None, shared=None, keys=None, parent=None, dpi=None,
                 always_on_top=False, px_scale=1, bgcolor='white'):

        super(VolumeRendering, self).__init__(
            title, size, position, show, autoswap, app, create_native, vsync,
            resizable, decorate, fullscreen, config, shared, keys, parent, dpi,
            always_on_top, px_scale, bgcolor)


def render_embryo(vol_path):

    # Load data
    print "Loading NRRD file"
    vol_data = sitk.ReadImage(vol_path)
    volume = sitk.GetArrayFromImage(vol_data)

    # Prepare canvas
    canvas = VolumeRendering(keys='interactive', size=(500, 500), show=False)
    canvas.measure_fps()

    # Set up a viewbox to display the image with interactive pan/zoom
    view = canvas.central_widget.add_view()

    # Set whether we are emulating a 3D texture
    emulate_texture = False

    # Create the volume visuals, only one is visible
    clim = (np.amax(volume) * 0.1, np.amax(volume))
    volume1 = scene.visuals.Volume(volume, clim=clim, parent=view.scene, emulate_texture=emulate_texture)

    # Create camera
    fov = 60.
    view.camera = scene.cameras.TurntableCamera(parent=view.scene, fov=fov, name='Turntable', distance=volume.shape[0])
    view.camera.elevation = 10
    view.camera.azimuth = 120

    # create colormaps that work well for translucent and additive volume rendering
    class TransFire(BaseColormap):
        glsl_map = """
        vec4 translucent_fire(float t) {
            return vec4(pow(t, 0.5), t, t*t, max(0, t*1.05 - 0.05));
        }
        """

    # Set rendering method
    volume1.method = 'translucent'
    volume1.cmap = TransFire()

    # Render the scene, and write image
    print "Rendering..."
    scrn = canvas.render()
    im = sitk.GetImageFromArray(scrn, isVector=True)
    out_path = 'qc/volume_rendering.png'
    print "Writing image"
    sitk.WriteImage(im, out_path)

if __name__ == '__main__':

    # Render embryo
    render_embryo("/home/james/Downloads/437291_56.nrrd")
