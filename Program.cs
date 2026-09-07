using Microsoft.EntityFrameworkCore;
using btsosecim.Data;

var builder = WebApplication.CreateBuilder(args);

// CORS Ayarı: Hem yerel testlerde (localhost) hem de yarın 
// Vercel'de canlıya aldığımızda sorunsuz çalışması için "AllowAnyOrigin" yapıldı.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()    // Vercel ve tüm localhost portlarına izin verir
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS Middleware'ini Devreye Al
app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();