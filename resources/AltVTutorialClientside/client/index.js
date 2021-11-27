/// <reference types ="@altv/types-client" />
/// <reference types ="@altv/types-natives" />


import * as alt from "alt-client"
import * as native from "natives"
import * as NativeUI from 'includes/NativeUIMenu/NativeUI.mjs';

//Variables
let loginHud;
let guiHud;
let lockHud;

//Commands
alt.onServer('freezePlayer', (freeze) => {
    const lPlayer = alt.Player.local.scriptID;
    native.freezeEntityPosition(lPlayer, freeze);
})

//Login/Register
alt.onServer('CloseLoginHud', () => {
    alt.showCursor(false);
    alt.toggleGameControls(true);
    alt.toggleVoiceControls(true);

    if(loginHud)
    {
        loginHud.destroy();
    }
})

alt.onServer('SendErrorMessage', (text) => {
    loginHud.emit('ErrorMessage', text);
})

alt.on('connectionComplete', () => {
    loadBlips();

    guiHud = new alt.WebView("http://resource/gui/gui.html");

    loginHud = new alt.WebView("http://resource/login/login.html");
    loginHud.focus();

    alt.showCursor(true)
    alt.toggleGameControls(false)
    alt.toggleVoiceControls(false)

    loginHud.on('Auth.Login', (name, password) => {
        alt.emitServer('Event.Login', name, password);
    })

    loginHud.on('Auth.Register', (name, password) => {
        alt.emitServer('Event.Register', name, password);
    })
})

//Notifications
alt.onServer('sendNotification', (status, text) => {
    guiHud.emit('sendNotification', status, text);
})

//Player Huds
alt.onServer('updatePB', (bar, wert) => {
    guiHud.emit('updatePB', bar, wert);
})

//Blips
function loadBlips()
{
    createBlip(-427.85934, 1115.0637, 326.76343,8,29,1.0,false,"Zivispawn");
}

function createBlip(x,y,z,sprite,color,scale=1.0,shortRange=false,name="")
{
    const tempBlip = new alt.PointBlip(x,y,z);

    tempBlip.sprite = sprite;
    tempBlip.color = color;
    tempBlip.scale = scale;
    tempBlip.shortRange = shortRange;
    if(name.length > 0)
    tempBlip.name = name;
}

//DrawText2D
function drawText2d( 
    msg,
    x,
    y,
    scale,
    fontType,
    r,
    g,
    b,
    a,
    useOutline = true,
    useDropShadow = true,
    layer = 0,
    align = 0
 ) {
    let hex = msg.match('{.*}');
    if (hex) {
        const rgb = hexToRgb(hex[0].replace('{', '').replace('}', ''));
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
        msg = msg.replace(hex[0], '');
    }
 
    native.beginTextCommandDisplayText('STRING');
    native.addTextComponentSubstringPlayerName(msg);
    native.setTextFont(fontType);
    native.setTextScale(1, scale);
    native.setTextWrap(0.0, 1.0);
    native.setTextCentre(true);
    native.setTextColour(r, g, b, a);
    native.setTextJustification(align);
 
    if (useOutline) {
        native.setTextOutline();
    }
 
    if (useDropShadow) {
        native.setTextDropShadow();
    }
 
    native.endTextCommandDisplayText(x, y, 0);
}

//Speedometer
function getSpeedColor(kmh) {
    if(kmh < 65)
        return "~g~";
    if(kmh >= 65 && kmh < 125)
        return "~y~";
    if(kmh >= 125)
        return "~r~";
}

//Native UI Vehiclespawner
alt.onServer('nativeUITest', () => {
    const ui = new NativeUI.Menu("Fahrzeug Spawner", "Spawne dir ein Fahrzeug", new NativeUI.Point(250,250));
    ui.Open();

    ui.AddItem(new NativeUI.UIMenuListItem(
        "Fahrzeug",
        "Fahrzeugbeschreibung",
        new NativeUI.ItemsCollection(["Kein Fahrzeug","Sultan","Infernus"])
    ));

    ui.ItemSelect.on(item => {
        if(item instanceof NativeUI.UIMenuListItem) {
            alt.emitServer('Event.SpawnVehicle', item.SelectedItem.DisplayText);
        }
    });
})

alt.everyTick(() => {
    const lPlayer = alt.Player.local;
    let vehicle = lPlayer.vehicle;
    if(vehicle)
    {
        let speed = vehicle.speed*3.6;
        speed = Math.round(speed);
        drawText2d(`${getSpeedColor(speed)}${speed} KMH`,0.45,0.91,1.5,2,255,255,255,255,true);
    }
});

//Lockpicking
alt.onServer('showLockpicking', () => {
    lockHud = new alt.WebView("http://resource/lockpicking/lockpicking.html");
    lockHud.focus();

    alt.showCursor(true)
    alt.toggleGameControls(false)
    alt.toggleVoiceControls(false)

    lockHud.on('successLockpicking', () => {
        alt.emitServer('Event.successLockpickingServer');

        if(lockHud)
        {
            lockHud.destroy();
        }

        alt.showCursor(false)
        alt.toggleGameControls(true)
        alt.toggleVoiceControls(true)
    })

    lockHud.on('failedLockpicking', () => {
        alt.emitServer('Event.failedLockpickingServer');

        if(lockHud)
        {
            lockHud.destroy();
        }

        alt.showCursor(false)
        alt.toggleGameControls(true)
        alt.toggleVoiceControls(true)
    })
})

//Tastendrücke
alt.on('keydown', (key) => {
    if(key == 77)
    {
        alt.emitServer('Event.startStopEngine');
    }
})