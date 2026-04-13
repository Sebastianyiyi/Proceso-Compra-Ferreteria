namespace ClientesAPI.Helpers
{
    public static class ValidadorDocumentoEcuador
    {
        /// <summary>
        /// Detecta si un número es CI (10 dígitos) o RUC (13 dígitos).
        /// Solo valida longitud y que sean dígitos numéricos.
        /// Retorna (esValido, tipoDocumento).
        /// </summary>
        public static (bool esValido, string tipoDocumento) Validar(string numero)
        {
            if (string.IsNullOrWhiteSpace(numero) || !numero.All(char.IsDigit))
                return (false, "");

            return numero.Length switch
            {
                10 => (true, "CI"),
                13 => (true, "RUC"),
                _  => (false, "")
            };
        }
    }
}