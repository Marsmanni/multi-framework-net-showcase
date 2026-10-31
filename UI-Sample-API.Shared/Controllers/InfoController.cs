using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace UI_Sample_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InfoController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public InfoController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet]
        public IActionResult Get()
        {
            // Git commit from publish-time file (falls vorhanden)
            var commit = "unknown";
            var commitFile = Path.Combine(_env.ContentRootPath, "git-commit.txt");
            if (System.IO.File.Exists(commitFile))
            {
                commit = System.IO.File.ReadAllText(commitFile).Trim();
            }

#if NET10_0
            // .NET 10 spezifischer Code
            return Ok(new { version = "NET 10", name = "I", commit });
#elif NET8_0
            // .NET 8 spezifischer Code
            return Ok(new { version = "NET 8", commit });
#else
            return Ok(new { version = "Unknown", commit });
#endif
        }
    }
}