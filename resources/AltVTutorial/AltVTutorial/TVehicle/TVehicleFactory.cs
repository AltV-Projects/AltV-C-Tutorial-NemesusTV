﻿using AltV.Net;
using AltV.Net.Elements.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AltVTutorial.TVehicle
{
    public class TVehicleFactory : IEntityFactory<IVehicle>
    {
        public IVehicle Create(IServer server, IntPtr entityPointer, ushort id)
        {
            return new TVehicle(server, entityPointer, id);
        }
    }
}
