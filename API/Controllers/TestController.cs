using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class TestController
    {
        [HttpGet("api/test")]
        public ActionResult<string> Get()
        {
            return "Hello from the test controller";
        }
    }
}