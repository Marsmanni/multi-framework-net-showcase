namespace UI_Sample_API.Models
{
    public class Location
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string TimeZone { get; set; } = string.Empty;
    }
}