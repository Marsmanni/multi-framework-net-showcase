using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NodaTime;
using SolCalc;
using SolCalc.Data;
using UI_Sample_API.Models;
//using Unfucked;

namespace UI_Sample_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SunriseSunsetController : ControllerBase
    {
        // Predefined locations
        private static readonly List<Location> Locations = new()
        {
            new() { Id = "berlin", Name = "Berlin", Latitude = 52.5200, Longitude = 13.4050, TimeZone = "Europe/Berlin" },
            new() { Id = "london", Name = "London", Latitude = 51.5074, Longitude = -0.1278, TimeZone = "Europe/London" },
            new() { Id = "tokyo", Name = "Tokyo", Latitude = 35.6762, Longitude = 139.6503, TimeZone = "Asia/Tokyo" },
            new() { Id = "newyork", Name = "New York", Latitude = 40.7128, Longitude = -74.0060, TimeZone = "America/New_York" },
            new() { Id = "sydney", Name = "Sydney", Latitude = -33.8688, Longitude = 151.2093, TimeZone = "Australia/Sydney" },
            new() { Id = "stuttgart", Name = "Stuttgart", Latitude = 48.7758, Longitude = 9.1829, TimeZone = "Europe/Berlin" },
            // Additional, lesser-known capitals
            new() { Id = "banjul", Name = "Banjul", Latitude = 13.4549, Longitude = -16.5790, TimeZone = "Africa/Banjul" },
            new() { Id = "thimphu", Name = "Thimphu", Latitude = 27.4728, Longitude = 89.6390, TimeZone = "Asia/Thimphu" },
            new() { Id = "bishkek", Name = "Bishkek", Latitude = 42.8746, Longitude = 74.6122, TimeZone = "Asia/Bishkek" },
            new() { Id = "porto-novo", Name = "Porto-Novo", Latitude = 6.4969, Longitude = 2.6289, TimeZone = "Africa/Porto-Novo" },
            new() { Id = "honiara", Name = "Honiara", Latitude = -9.4456, Longitude = 159.9729, TimeZone = "Pacific/Guadalcanal" }
        };

        /// <summary>
        /// Returns sunrise and sunset times for Berlin
        /// </summary>
        [HttpGet("berlin", Name = "GetSunTimesBerlin")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        public ActionResult<SunTimes> GetBerlin([FromQuery] DateTime? date = null)
        {
            return GetSunTimesForLocation("berlin", date ?? DateTime.Today);
        }

        /// <summary>
        /// Returns sunrise and sunset times for London
        /// </summary>
        [HttpGet("london", Name = "GetSunTimesLondon")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        public ActionResult<SunTimes> GetLondon([FromQuery] DateTime? date = null)
        {
            return GetSunTimesForLocation("london", date ?? DateTime.Today);
        }

        /// <summary>
        /// Returns sunrise and sunset times for Tokyo
        /// </summary>
        [HttpGet("tokyo", Name = "GetSunTimesTokyo")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        public ActionResult<SunTimes> GetTokyo([FromQuery] DateTime? date = null)
        {
            return GetSunTimesForLocation("tokyo", date ?? DateTime.Today);
        }

        /// <summary>
        /// Returns sunrise and sunset times for New York
        /// </summary>
        [HttpGet("newyork", Name = "GetSunTimesNewYork")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        public ActionResult<SunTimes> GetNewYork([FromQuery] DateTime? date = null)
        {
            return GetSunTimesForLocation("newyork", date ?? DateTime.Today);
        }

        /// <summary>
        /// Returns sunrise and sunset times for Sydney
        /// </summary>
        [HttpGet("sydney", Name = "GetSunTimesSydney")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        public ActionResult<SunTimes> GetSydney([FromQuery] DateTime? date = null)
        {
            return GetSunTimesForLocation("sydney", date ?? DateTime.Today);
        }

        /// <summary>
        /// Returns sunrise and sunset times for arbitrary coordinates
        /// </summary>
        [HttpGet("coordinates", Name = "GetSunTimesByCoordinates")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<SunTimes> GetByCoordinates(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] DateTime? date = null)
        {
            if (latitude < -90 || latitude > 90)
            {
                return BadRequest(new { message = "Latitude must be between -90 and 90" });
            }

            if (longitude < -180 || longitude > 180)
            {
                return BadRequest(new { message = "Longitude must be between -180 and 180" });
            }

            var targetDate = date ?? DateTime.Today;
            var sunTimes = CalculateSunTimes(latitude, longitude, targetDate);

            return Ok(new SunTimes
            {
                Location = $"Custom ({latitude:F4}, {longitude:F4})",
                Latitude = latitude,
                Longitude = longitude,
                Date = targetDate,
                Sunrise = sunTimes.Sunrise,
                Sunset = sunTimes.Sunset,
                SolarNoon = sunTimes.SolarNoon,
                DayLength = sunTimes.DayLength,
                TimeZone = "UTC"
            });
        }

        /// <summary>
        /// General endpoint: Returns times for a location based on the location key as a query parameter.
        /// Example: GET /SunriseSunset?location=banjul&date=2025-12-10
        /// </summary>
        [HttpGet(Name = "GetSunTimesByLocationQuery")]
        [ProducesResponseType(typeof(SunTimes), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<SunTimes> GetByLocationQuery([FromQuery(Name = "location")] string location, [FromQuery] DateTime? date = null)
        {
            if (string.IsNullOrWhiteSpace(location))
            {
                return BadRequest(new { message = "Query parameter 'location' must be provided" });
            }

            try
            {
                var sunTimes = GetSunTimesForLocation(location, date ?? DateTime.Today);
                return Ok(sunTimes);
            }
            catch (ArgumentException)
            {
                return NotFound(new { message = $"Location '{location}' not found" });
            }
        }

        /// <summary>
        /// Returns sunrise and sunset times for multiple days
        /// </summary>
        [HttpGet("berlin/range", Name = "GetSunTimesBerlinRange")]
        [ProducesResponseType(typeof(IEnumerable<SunTimes>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<IEnumerable<SunTimes>> GetBerlinRange(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] int days = 7)
        {
            if (days < 1 || days > 365)
            {
                return BadRequest(new { message = "Days must be between 1 and 365" });
            }

            var start = startDate ?? DateTime.Today;
            var results = new List<SunTimes>();

            for (int i = 0; i < days; i++)
            {
                var currentDate = start.AddDays(i);
                var sunTimes = GetSunTimesForLocation("berlin", currentDate);
                if (sunTimes != null)
                {
                    results.Add(sunTimes);
                }
            }

            return Ok(results);
        }

        /// <summary>
        /// Returns all available locations
        /// </summary>
        [HttpGet("locations", Name = "GetAvailableLocations")]
        [ProducesResponseType(typeof(IEnumerable<Location>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<Location>> GetLocations()
        {
            return Ok(Locations);
        }

        // Helper methods

        private SunTimes GetSunTimesForLocation(string locationKey, DateTime date)
        {
            var location = Locations.FirstOrDefault(l => l.Id.Equals(locationKey, StringComparison.OrdinalIgnoreCase));

            if (location == null)
            {
                throw new ArgumentException($"Location '{locationKey}' not found");
            }

            var sunTimes = CalculateSunTimesFromLocation(location, date);

            return new SunTimes
            {
                Location = location.Name,
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                Date = date,
                Sunrise = sunTimes.Sunrise,
                Sunset = sunTimes.Sunset,
                SolarNoon = sunTimes.SolarNoon,
                DayLength = sunTimes.DayLength,
                TimeZone = location.TimeZone
            };
        }

        private (DateTime? Sunrise, DateTime? Sunset, DateTime? SolarNoon, TimeSpan? DayLength) CalculateSunTimes(
            double latitude,
            double longitude,
            DateTime date)
        {
            try
            {
                // Determine the time zone for the given coordinates (or use provided)
                DateTimeZone zone = DateTimeZoneProviders.Tzdb["Europe/Berlin"];

                // Convert DateTime to NodaTime LocalDate
                LocalDate localDate = LocalDate.FromDateTime(date);

                // Convert LocalDate to ZonedDateTime at the start of the day
                ZonedDateTime zonedDate = zone.AtStartOfDay(localDate);

                // SolCalc calculation
                IEnumerable<SunlightChange> dailySunriseAndSunset = SunlightCalculator
                    .GetSunlightChanges(zonedDate, latitude, longitude)
                    .TakeWhile(s => s.Time.Date == zonedDate.Date)
                    .ToList();
                ZonedDateTime? sunrise = dailySunriseAndSunset.FirstOrDefault(s => s.Name == SolarTimeOfDay.Sunrise).Time;
                ZonedDateTime? sunset = dailySunriseAndSunset.FirstOrDefault(s => s.Name == SolarTimeOfDay.Sunset).Time;

                TimeSpan? dayLength = null;
                if (sunrise.HasValue && sunset.HasValue)
                {
                    // Fix: Convert NodaTime.Duration to System.TimeSpan
                    dayLength = (sunset.Value - sunrise.Value).ToTimeSpan();
                }

                // solarNoon is missing in the original, add if needed
                DateTime? solarNoon = null;

                return (sunrise?.ToDateTimeUnspecified(), sunset?.ToDateTimeUnspecified(), solarNoon, dayLength);
            }
            catch
            {
                return (null, null, null, null);
            }
        }

        private (DateTime? Sunrise, DateTime? Sunset, DateTime? SolarNoon, TimeSpan? DayLength) CalculateSunTimesFromLocation(
            Location location,
            DateTime date)
        {
            try
            {
                // Determine the time zone for the given coordinates (or use provided)
                DateTimeZone zone = DateTimeZoneProviders.Tzdb[location.TimeZone];

                // Convert DateTime to NodaTime LocalDate
                LocalDate localDate = LocalDate.FromDateTime(date);

                // Convert LocalDate to ZonedDateTime at the start of the day
                ZonedDateTime zonedDate = zone.AtStartOfDay(localDate);

                // SolCalc calculation
                IEnumerable<SunlightChange> dailySunriseAndSunset = SunlightCalculator
                    .GetSunlightChanges(zonedDate, location.Latitude, location.Longitude)
                    .TakeWhile(s => s.Time.Date == zonedDate.Date)
                    .ToList();
                ZonedDateTime? sunrise = dailySunriseAndSunset.FirstOrDefault(s => s.Name == SolarTimeOfDay.Sunrise).Time;
                ZonedDateTime? sunset = dailySunriseAndSunset.FirstOrDefault(s => s.Name == SolarTimeOfDay.Sunset).Time;

                TimeSpan? dayLength = null;
                if (sunrise.HasValue && sunset.HasValue)
                {
                    // Fix: Convert NodaTime.Duration to System.TimeSpan
                    dayLength = (sunset.Value - sunrise.Value).ToTimeSpan();
                }

                // solarNoon is missing in the original, add if needed
                DateTime? solarNoon = null;

                return (sunrise?.ToDateTimeUnspecified(), sunset?.ToDateTimeUnspecified(), solarNoon, dayLength);
            }
            catch
            {
                return (null, null, null, null);
            }
        }
    }
}