namespace UI_Sample_API.Models
{
    public class SunTimes
    {
        public string Location { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Date { get; set; }
        public DateTime? Sunrise { get; set; }
        public DateTime? Sunset { get; set; }
        public DateTime? SolarNoon { get; set; }
        public TimeSpan? DayLength { get; set; }
        public string TimeZone { get; set; } = string.Empty;
    }
}