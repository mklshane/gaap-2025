import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RedLightGreenLight } from './home/App'
import Permissions from './permissions/permissions'
import { Profile } from './profile/profile'
import { Spectator } from './spectator/Spectator'
import { Admin } from './admin/Admin'

// there's probably a better way to do this, but for now, this will do D:

const params = new URLSearchParams(window.location.search);
const spectator = params.get('spectator') === 'true'
const admin = params.get('admin') === 'true'

const root = createRoot(document.getElementById('root')!)

if (admin) {
  root.render(
    <Admin></Admin>
  );
} else if (spectator) {
  root.render(
    <Spectator />
  );
} else {
  root.render(
    <Permissions>
      <Profile />
    </Permissions>
  );
}
